import { prisma } from '@/lib/prisma'
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../types'

export class ProductService {
  async getProducts(filters: ProductFilters = {}) {
    const { search, category, isActive, productType } = filters
    
    let whereClause: any = {
      isArchived: false
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category) {
      whereClause.category = category
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive
    }
    
    if (productType) {
      whereClause.productType = productType
    }
    
    return prisma.product.findMany({
      where: whereClause,
      include: {
        attributes: {
          include: {
            options: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        variants: {
          where: { isActive: true }
        },
        _count: {
          select: {
            quotationItems: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })
  }

  async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        attributes: {
          include: {
            options: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            quotationItems: true
          }
        }
      }
    })
  }

  async createProduct(data: CreateProductRequest) {
    // Check for duplicate SKU
    if (data.sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku: data.sku }
      })
      
      if (existingProduct) {
        throw new Error('SKU already exists')
      }
    }

    const {
      name,
      description,
      sku,
      category,
      productType = 'SIMPLE',
      pricingType = 'FIXED',
      basePrice = 0,
      costPrice,
      calculationFormula,
      trackInventory = false,
      currentStock,
      minStockLevel,
      unit = 'piece',
      defaultTaxRate = 18,
      attributes,
      variants
    } = data

    return prisma.product.create({
      data: {
        name,
        description,
        sku,
        category,
        productType,
        pricingType,
        basePrice,
        costPrice,
        calculationFormula,
        trackInventory,
        currentStock: trackInventory ? (currentStock || 0) : null,
        minStockLevel: trackInventory ? (minStockLevel || 0) : null,
        unit,
        defaultTaxRate,
        attributes: attributes ? {
          create: attributes.map((attr: any) => ({
            name: attr.name,
            type: attr.type,
            isRequired: attr.isRequired || false,
            isConfigurable: attr.isConfigurable !== false,
            minValue: attr.minValue,
            maxValue: attr.maxValue,
            defaultValue: attr.defaultValue,
            unit: attr.unit,
            options: attr.options ? {
              create: attr.options.map((option: any, index: number) => ({
                value: option.value,
                displayName: option.displayName || option.value,
                priceModifier: option.priceModifier || 0,
                costModifier: option.costModifier || 0,
                isActive: option.isActive !== false,
                sortOrder: option.sortOrder || index
              }))
            } : undefined
          }))
        } : undefined,
        variants: variants ? {
          create: variants.map((variant: any) => ({
            sku: variant.sku,
            name: variant.name,
            configuration: variant.configuration,
            price: variant.price,
            costPrice: variant.costPrice,
            stock: trackInventory ? (variant.stock || 0) : null
          }))
        } : undefined
      },
      include: {
        attributes: {
          include: {
            options: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        variants: true
      }
    })
  }

  async updateProduct(id: string, data: UpdateProductRequest) {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      throw new Error('Product not found')
    }

    // Check for duplicate SKU if updating
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuTaken = await prisma.product.findFirst({
        where: {
          sku: data.sku,
          NOT: { id }
        }
      })
      
      if (skuTaken) {
        throw new Error('SKU already in use')
      }
    }

    const updateData: any = {}
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        attributes: {
          include: {
            options: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        variants: true,
        _count: {
          select: {
            quotationItems: true
          }
        }
      }
    })
  }

  async deleteProduct(id: string) {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({ where: { id } })
    if (!existingProduct) {
      throw new Error('Product not found')
    }

    // Check if product is used in quotations
    const quotationCount = await prisma.quotationItem.count({
      where: { productId: id }
    })

    if (quotationCount > 0) {
      // Soft delete if used in quotations
      return prisma.product.update({
        where: { id },
        data: { isArchived: true, isActive: false }
      })
    } else {
      // Hard delete if not used
      return prisma.product.delete({
        where: { id }
      })
    }
  }

  async calculateProductPrice(id: string, configuration: any, quantity: number = 1) {
    const product = await prisma.product.findUnique({
      where: { 
        id,
        isArchived: false,
        isActive: true
      },
      include: {
        attributes: {
          include: {
            options: true
          }
        },
        variants: true
      }
    })

    if (!product) {
      throw new Error('Product not found')
    }

    let calculatedPrice = 0
    let calculatedCost = 0
    let errors: string[] = []
    
    try {
      switch (product.pricingType) {
        case 'FIXED':
          calculatedPrice = Number(product.basePrice)
          calculatedCost = Number(product.costPrice || 0)
          break
          
        case 'CALCULATED':
          if (!product.calculationFormula) {
            throw new Error('Calculation formula not defined for this product')
          }
          
          calculatedPrice = this.calculateWithFormula(
            product.calculationFormula, 
            configuration, 
            Number(product.basePrice)
          )
          calculatedCost = Number(product.costPrice || 0)
          break
          
        case 'VARIANT_BASED':
          const variant = this.findMatchingVariant(product.variants, configuration)
          if (variant) {
            calculatedPrice = Number(variant.price || product.basePrice)
            calculatedCost = Number(variant.costPrice || product.costPrice || 0)
          } else {
            calculatedPrice = Number(product.basePrice)
            calculatedCost = Number(product.costPrice || 0)
          }
          break
          
        case 'PER_UNIT':
          const unitValue = configuration?.quantity || configuration?.area || 1
          calculatedPrice = Number(product.basePrice) * unitValue
          calculatedCost = Number(product.costPrice || 0) * unitValue
          break
          
        default:
          calculatedPrice = Number(product.basePrice)
          calculatedCost = Number(product.costPrice || 0)
      }
      
      // Apply attribute-based price modifiers
      const priceModifier = this.calculateAttributeModifiers(product.attributes, configuration)
      calculatedPrice += priceModifier.price
      calculatedCost += priceModifier.cost
      
      // Validate required attributes
      const missingRequired = this.validateRequiredAttributes(product.attributes, configuration)
      if (missingRequired.length > 0) {
        errors.push(`Missing required attributes: ${missingRequired.join(', ')}`)
      }
      
    } catch (error) {
      errors.push(`Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      calculatedPrice = Number(product.basePrice)
    }
    
    const totalPrice = calculatedPrice * quantity
    const totalCost = calculatedCost * quantity
    const margin = totalPrice - totalCost
    const marginPercent = totalPrice > 0 ? (margin / totalPrice) * 100 : 0
    
    return {
      productId: product.id,
      productName: product.name,
      configuration,
      quantity,
      unitPrice: Math.round(calculatedPrice * 100) / 100,
      unitCost: Math.round(calculatedCost * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      marginPercent: Math.round(marginPercent * 100) / 100,
      taxRate: Number(product.defaultTaxRate),
      unit: product.unit,
      errors
    }
  }

  private calculateWithFormula(formula: string, config: any, basePrice: number): number {
    try {
      // Simple formula evaluator - replace variables with values
      let expression = formula
      
      // Replace common variables
      if (config.width) expression = expression.replace(/width/g, config.width.toString())
      if (config.height) expression = expression.replace(/height/g, config.height.toString())
      if (config.length) expression = expression.replace(/length/g, config.length.toString())
      if (config.area) expression = expression.replace(/area/g, config.area.toString())
      if (config.quantity) expression = expression.replace(/quantity/g, config.quantity.toString())
      
      expression = expression.replace(/basePrice/g, basePrice.toString())
      
      // Simple math evaluation (be careful in production - this is just for demo)
      const result = Function(`"use strict"; return (${expression})`)()
      
      return Number(result) || basePrice
    } catch (error) {
      console.error('Formula calculation error:', error)
      return basePrice
    }
  }

  private findMatchingVariant(variants: any[], configuration: any) {
    return variants.find(variant => {
      const variantConfig = variant.configuration
      return Object.keys(configuration).every(key => 
        variantConfig[key] === configuration[key]
      )
    })
  }

  private calculateAttributeModifiers(attributes: any[], configuration: any) {
    let priceModifier = 0
    let costModifier = 0
    
    attributes.forEach(attribute => {
      const selectedValue = configuration[attribute.name.toLowerCase()]
      
      if (selectedValue && attribute.options) {
        const option = attribute.options.find((opt: any) => opt.value === selectedValue)
        
        if (option) {
          priceModifier += Number(option.priceModifier || 0)
          costModifier += Number(option.costModifier || 0)
        }
      }
    })
    
    return { price: priceModifier, cost: costModifier }
  }

  private validateRequiredAttributes(attributes: any[], configuration: any): string[] {
    const missing: string[] = []
    
    attributes
      .filter(attr => attr.isRequired)
      .forEach(attr => {
        const value = configuration[attr.name.toLowerCase()]
        if (!value) {
          missing.push(attr.name)
        }
      })
    
    return missing
  }
}