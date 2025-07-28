import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import QuotationPDFTemplate from '@/components/pdf/QuotationPDFTemplate'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quotationId } = await params

    // Fetch quotation with all related data
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
                category: true,
                productType: true,
              }
            }
          }
        },
        createdBy: true,
      },
    })

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    // Fetch PDF settings
    let settings = await prisma.pDFSettings.findFirst()
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.pDFSettings.create({
        data: {}
      })
    }

    // Convert Prisma Decimal objects to numbers for React PDF
    const processedQuotation = {
      ...quotation,
      subtotal: Number(quotation.subtotal),
      totalTax: Number(quotation.totalTax),
      totalDiscount: Number(quotation.totalDiscount),
      grandTotal: Number(quotation.grandTotal),
      items: quotation.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        calculatedPrice: item.calculatedPrice ? Number(item.calculatedPrice) : undefined,
        discount: Number(item.discount),
        taxPercent: Number(item.taxPercent),
        subtotal: Number(item.subtotal),
      }))
    }

    // Convert settings Decimal objects to numbers
    const processedSettings = {
      ...settings,
      defaultTaxRate: Number(settings.defaultTaxRate)
    }

    // Generate PDF using React PDF template with settings
    const pdfBuffer = await renderToBuffer(React.createElement(QuotationPDFTemplate, { 
      quotation: processedQuotation, 
      settings: processedSettings 
    }))

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${quotation.quotationNumber}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}