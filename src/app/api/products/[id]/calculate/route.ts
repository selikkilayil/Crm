import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth-dynamic'
import { hasPermission } from '@/lib/dynamic-permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    
    // Check permissions
    if (!(await hasPermission(user, { resource: 'quotations', action: 'create' })) && 
        !(await hasPermission(user, { resource: 'quotations', action: 'edit_all' }))) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const body = await request.json()
    const { configuration, quantity = 1 } = body
    
    // Get product with attributes and options
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
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
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
          
          calculatedPrice = calculateWithFormula(
            product.calculationFormula, 
            configuration, 
            Number(product.basePrice)
          )
          calculatedCost = Number(product.costPrice || 0)
          break
          
        case 'VARIANT_BASED':
          const variant = findMatchingVariant(product.variants, configuration)
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
      const priceModifier = calculateAttributeModifiers(product.attributes, configuration)
      calculatedPrice += priceModifier.price
      calculatedCost += priceModifier.cost
      
      // Validate required attributes
      const missingRequired = validateRequiredAttributes(product.attributes, configuration)
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
    
    return NextResponse.json({
      data: {
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
    })
  } catch (error) {
    console.error('Error calculating product price:', error)
    return NextResponse.json({ error: 'Failed to calculate price' }, { status: 500 })
  }
}

function calculateWithFormula(formula: string, config: any, basePrice: number): number {
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
    // In production, use a proper math expression parser
    const result = Function(`"use strict"; return (${expression})`)()
    
    return Number(result) || basePrice
  } catch (error) {
    console.error('Formula calculation error:', error)
    return basePrice
  }
}

function findMatchingVariant(variants: any[], configuration: any) {
  return variants.find(variant => {
    const variantConfig = variant.configuration
    return Object.keys(configuration).every(key => 
      variantConfig[key] === configuration[key]
    )
  })
}

function calculateAttributeModifiers(attributes: any[], configuration: any) {
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

function validateRequiredAttributes(attributes: any[], configuration: any): string[] {
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