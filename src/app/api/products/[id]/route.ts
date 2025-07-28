import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import { PERMISSIONS, hasPermission } from '@/lib/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    
    // Check permissions
    if (!hasPermission(user.role, PERMISSIONS.PRODUCTS_VIEW)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const product = await prisma.product.findUnique({
      where: { 
        id,
        isArchived: false
      },
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
        quotationItems: {
          include: {
            quotation: {
              select: {
                id: true,
                quotationNumber: true,
                date: true,
                status: true,
                customer: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json({ data: product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    
    // Check permissions
    if (!hasPermission(user.role, PERMISSIONS.PRODUCTS_EDIT)) {
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
      isActive
    } = body
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id, isArchived: false }
    })
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Check for duplicate SKU (excluding current product)
    if (sku && sku !== existingProduct.sku) {
      const duplicateProduct = await prisma.product.findUnique({
        where: { sku }
      })
      
      if (duplicateProduct) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 400 })
      }
    }
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name || existingProduct.name,
        description,
        sku,
        category,
        productType: productType || existingProduct.productType,
        pricingType: pricingType || existingProduct.pricingType,
        basePrice: basePrice !== undefined ? basePrice : existingProduct.basePrice,
        costPrice,
        calculationFormula,
        trackInventory: trackInventory !== undefined ? trackInventory : existingProduct.trackInventory,
        currentStock: trackInventory ? currentStock : null,
        minStockLevel: trackInventory ? minStockLevel : null,
        unit: unit || existingProduct.unit,
        defaultTaxRate: defaultTaxRate !== undefined ? defaultTaxRate : existingProduct.defaultTaxRate,
        isActive: isActive !== undefined ? isActive : existingProduct.isActive
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
    
    return NextResponse.json({ data: product, message: 'Product updated successfully' })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    
    // Check permissions
    if (!hasPermission(user.role, PERMISSIONS.PRODUCTS_DELETE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id, isArchived: false },
      include: {
        quotationItems: true,
        _count: {
          select: {
            quotationItems: true
          }
        }
      }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    // Check if product is used in quotations
    if (product._count.quotationItems > 0) {
      // Soft delete if used in quotations
      await prisma.product.update({
        where: { id },
        data: {
          isArchived: true,
          isActive: false
        }
      })
      
      return NextResponse.json({ 
        message: 'Product archived successfully (product was used in quotations)' 
      })
    } else {
      // Hard delete if not used anywhere
      await prisma.product.delete({
        where: { id }
      })
      
      return NextResponse.json({ message: 'Product deleted successfully' })
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}