import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { QuotationStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const search = searchParams.get('search')

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status as QuotationStatus
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (search) {
      where.OR = [
        { quotationNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { company: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const quotations = await prisma.quotation.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(quotations)
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerId,
      validUntil,
      paymentTerms,
      deliveryTerms,
      currency = 'INR',
      notes,
      termsConditions,
      items = [],
      createdById,
    } = body

    // Generate quotation number
    const year = new Date().getFullYear()
    const count = await prisma.quotation.count()
    const quotationNumber = `QT-${year}-${String(count + 1).padStart(4, '0')}`

    // Calculate totals
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

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        validUntil: validUntil ? new Date(validUntil) : null,
        paymentTerms,
        deliveryTerms,
        currency,
        subtotal,
        totalTax,
        totalDiscount,
        grandTotal,
        notes,
        termsConditions,
        customerId,
        createdById,
        items: {
          create: processedItems,
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

    return NextResponse.json(quotation, { status: 201 })
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 })
  }
}