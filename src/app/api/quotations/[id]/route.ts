import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { QuotationStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
            billingAddress: true,
            shippingAddress: true,
            gstin: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
    
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }
    
    return NextResponse.json(quotation)
  } catch (error) {
    console.error('Error fetching quotation:', error)
    return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const body = await request.json()
    const {
      status,
      validUntil,
      paymentTerms,
      deliveryTerms,
      currency,
      notes,
      termsConditions,
      items = [],
    } = body

    // Calculate totals if items are provided
    let updateData: any = {}

    if (status !== undefined) {
      updateData.status = status as QuotationStatus
    }

    if (validUntil !== undefined) {
      updateData.validUntil = validUntil ? new Date(validUntil) : null
    }

    if (paymentTerms !== undefined) updateData.paymentTerms = paymentTerms
    if (deliveryTerms !== undefined) updateData.deliveryTerms = deliveryTerms
    if (currency !== undefined) updateData.currency = currency
    if (notes !== undefined) updateData.notes = notes
    if (termsConditions !== undefined) updateData.termsConditions = termsConditions

    // If items are provided, recalculate totals
    if (items.length > 0) {
      let subtotal = 0
      let totalTax = 0
      let totalDiscount = 0

      const processedItems = items.map((item: any) => {
        const quantity = parseFloat(item.quantity) || 0
        const unitPrice = parseFloat(item.unitPrice) || 0
        const discount = parseFloat(item.discount) || 0
        const taxPercent = parseFloat(item.taxPercent) || 0

        const lineSubtotal = quantity * unitPrice
        const discountAmount = (lineSubtotal * discount) / 100
        const taxableAmount = lineSubtotal - discountAmount
        const taxAmount = (taxableAmount * taxPercent) / 100
        const itemTotal = taxableAmount + taxAmount

        subtotal += lineSubtotal
        totalDiscount += discountAmount
        totalTax += taxAmount

        return {
          productName: item.productName,
          description: item.description || null,
          quantity,
          unitPrice,
          discount,
          taxPercent,
          subtotal: itemTotal,
        }
      })

      const grandTotal = subtotal - totalDiscount + totalTax

      updateData.subtotal = subtotal
      updateData.totalTax = totalTax
      updateData.totalDiscount = totalDiscount
      updateData.grandTotal = grandTotal

      // Delete existing items and create new ones
      await prisma.quotationItem.deleteMany({
        where: { quotationId: params.id },
      })

      updateData.items = {
        create: processedItems,
      }
    }

    const quotation = await prisma.quotation.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
            billingAddress: true,
            shippingAddress: true,
            gstin: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
    
    return NextResponse.json(quotation)
  } catch (error) {
    console.error('Error updating quotation:', error)
    return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    await prisma.quotation.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ message: 'Quotation deleted successfully' })
  } catch (error) {
    console.error('Error deleting quotation:', error)
    return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 })
  }
}