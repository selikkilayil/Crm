import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, hasPermission } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check permissions
    if (!hasPermission(user, 'products_view')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const productType = searchParams.get('productType')
    
    // Build where clause
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
    
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true'
    }
    
    if (productType) {
      whereClause.productType = productType
    }
    
    const products = await prisma.product.findMany({
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
    
    return NextResponse.json({ data: products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check permissions
    if (!hasPermission(user, 'products_create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const body = await request.json()
    const {
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
      currentStock,
      minStockLevel,
      unit,
      defaultTaxRate,
      attributes,
      variants
    } = body
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }
    
    // Check for duplicate SKU
    if (sku) {
      const existingProduct = await prisma.product.findUnique({
        where: { sku }
      })
      
      if (existingProduct) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 400 })
      }
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        category,
        productType: productType || 'SIMPLE',
        pricingType: pricingType || 'FIXED',
        basePrice: basePrice || 0,
        costPrice,
        calculationFormula,
        trackInventory: trackInventory || false,
        currentStock: trackInventory ? (currentStock || 0) : null,
        minStockLevel: trackInventory ? (minStockLevel || 0) : null,
        unit: unit || 'piece',
        defaultTaxRate: defaultTaxRate || 18,
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
    
    return NextResponse.json({ data: product, message: 'Product created successfully' })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}