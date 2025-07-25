import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const body = await request.json()
    const { createdById } = body

    // Get the original quotation
    const originalQuotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        items: true,
      },
    })

    if (!originalQuotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    // Generate new quotation number
    const year = new Date().getFullYear()
    const count = await prisma.quotation.count()
    const quotationNumber = `QT-${year}-${String(count + 1).padStart(4, '0')}`

    // Create duplicate quotation
    const duplicateQuotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        validUntil: originalQuotation.validUntil,
        paymentTerms: originalQuotation.paymentTerms,
        deliveryTerms: originalQuotation.deliveryTerms,
        currency: originalQuotation.currency,
        subtotal: originalQuotation.subtotal,
        totalTax: originalQuotation.totalTax,
        totalDiscount: originalQuotation.totalDiscount,
        grandTotal: originalQuotation.grandTotal,
        notes: originalQuotation.notes,
        termsConditions: originalQuotation.termsConditions,
        customerId: originalQuotation.customerId,
        createdById,
        status: 'DRAFT', // Always start as draft
        items: {
          create: originalQuotation.items.map(item => ({
            productName: item.productName,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxPercent: item.taxPercent,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: true,
      },
    })

    return NextResponse.json(duplicateQuotation, { status: 201 })
  } catch (error) {
    console.error('Error duplicating quotation:', error)
    return NextResponse.json({ error: 'Failed to duplicate quotation' }, { status: 500 })
  }
}