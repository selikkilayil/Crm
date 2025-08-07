import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { QuotationHandlers } from '@/domains/quotations'
import QuotationPDFTemplate from '@/components/pdf/QuotationPDFTemplate'
import { prisma } from '@/lib/prisma'

// GET /api/settings/pdf/preview - Generate a sample PDF with current settings
export async function GET(request: NextRequest) {
  try {
    // Get current PDF settings
    let settings = await prisma.pDFSettings.findFirst()
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.pDFSettings.create({
        data: {}
      })
    }

    // Process settings for PDF generation with proper defaults
    const processedSettings = {
      ...settings,
      // Convert Decimal fields to numbers with defaults
      defaultTaxRate: Number(settings.defaultTaxRate) || 18,
      lineHeight: Number(settings.lineHeight) || 1.4,
      
      // Ensure number fields are properly typed with defaults
      pageMarginTop: Number(settings.pageMarginTop) || 20,
      pageMarginBottom: Number(settings.pageMarginBottom) || 20,
      pageMarginLeft: Number(settings.pageMarginLeft) || 15,
      pageMarginRight: Number(settings.pageMarginRight) || 15,
      headerHeight: Number(settings.headerHeight) || 80,
      headerPadding: Number(settings.headerPadding) || 20,
      footerHeight: Number(settings.footerHeight) || 60,
      footerPadding: Number(settings.footerPadding) || 15,
      contentPadding: Number(settings.contentPadding) || 20,
      fontSize: Number(settings.fontSize) || 12,
      headingFontSize: Number(settings.headingFontSize) || 16,
      tableRowPadding: Number(settings.tableRowPadding) || 10,
      logoWidth: Number(settings.logoWidth) || 100,
      logoHeight: Number(settings.logoHeight) || 60,
      defaultValidityDays: Number(settings.defaultValidityDays) || 30,
      
      // Ensure boolean fields are properly typed
      showTaxBreakdown: Boolean(settings.showTaxBreakdown),
      headerShowLogo: Boolean(settings.headerShowLogo),
      headerShowAddress: Boolean(settings.headerShowAddress),
      footerShowPageNumber: Boolean(settings.footerShowPageNumber),
      footerShowDate: Boolean(settings.footerShowDate),
      tableShowBorders: Boolean(settings.tableShowBorders),

      // Ensure string fields have defaults
      logoUrl: settings.logoUrl || null,
      logoText: settings.logoText || 'L',
      logoPosition: settings.logoPosition || 'header-left',
      pageSize: settings.pageSize || 'A4',
      pageOrientation: settings.pageOrientation || 'portrait',
      quotationPrefix: settings.quotationPrefix || 'QT',
      quotationNumberFormat: settings.quotationNumberFormat || 'QT-YYYY-####',
      footerText: settings.footerText || 'Thank you for your business!',
      companyName: settings.companyName || 'YOUR COMPANY NAME',
      companyAddress: settings.companyAddress || '123 Business Street, Business City, State 12345',
      companyPhone: settings.companyPhone || '+91 98765 43210',
      companyEmail: settings.companyEmail || 'info@company.com',
      companyWebsite: settings.companyWebsite || 'www.yourcompany.com',
      companyGST: settings.companyGST || '29ABCDE1234F1Z5',
      defaultTermsConditions: settings.defaultTermsConditions || '',
      defaultPaymentTerms: settings.defaultPaymentTerms || '',
      defaultDeliveryTerms: settings.defaultDeliveryTerms || '',
      defaultCurrency: settings.defaultCurrency || 'INR',
      primaryColor: settings.primaryColor || '#2d3748',
      secondaryColor: settings.secondaryColor || '#6366f1',
      textColor: settings.textColor || '#1f2937',
      lightBackground: settings.lightBackground || '#f8fafc',
      tableHeaderBg: settings.tableHeaderBg || '#f8fafc',
      tableBorderColor: settings.tableBorderColor || '#e5e7eb',
      currencySymbol: settings.currencySymbol || '₹',
      footerAlignment: settings.footerAlignment || 'center',
      headerAlignment: settings.headerAlignment || 'left',
    }

    // Create sample quotation data
    const sampleQuotation = {
      id: 'sample-id',
      quotationNumber: 'QT-2025-0001',
      date: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'DRAFT' as const,
      paymentTerms: settings.defaultPaymentTerms,
      deliveryTerms: settings.defaultDeliveryTerms,
      currency: settings.defaultCurrency,
      subtotal: 10000,
      totalTax: 1800,
      totalDiscount: 500,
      grandTotal: 11300,
      notes: 'This is a sample quotation for preview purposes.',
      termsConditions: settings.defaultTermsConditions,
      customer: {
        id: 'sample-customer',
        name: 'Sample Customer Ltd.',
        email: 'customer@example.com',
        company: 'Sample Customer Ltd.',
        phone: '+91 98765 43210',
        billingAddress: '123 Customer Street, Customer City, State 12345',
        shippingAddress: '123 Customer Street, Customer City, State 12345',
        gstin: '29SAMPLE1234F1Z5'
      },
      createdBy: {
        id: 'sample-user',
        name: 'Sample User',
        email: 'user@company.com'
      },
      items: [
        {
          id: 'item-1',
          productName: 'Sample Product 1',
          description: 'High-quality sample product for demonstration',
          quantity: 2,
          unitPrice: 2500,
          calculatedPrice: undefined,
          discount: 10,
          taxPercent: Number(settings.defaultTaxRate),
          subtotal: 4950, // (2 * 2500 * 0.9) + tax
          notes: 'Custom configuration applied',
          product: {
            id: 'product-1',
            name: 'Sample Product 1',
            sku: 'SPL-001',
            unit: 'Piece',
            category: 'Electronics',
            productType: 'SIMPLE' as const
          }
        },
        {
          id: 'item-2',
          productName: 'Sample Service',
          description: 'Professional consulting service',
          quantity: 10,
          unitPrice: 500,
          calculatedPrice: undefined,
          discount: 0,
          taxPercent: Number(settings.defaultTaxRate),
          subtotal: 5900, // 10 * 500 + tax
          notes: undefined,
          product: {
            id: 'product-2',
            name: 'Sample Service',
            sku: 'SRV-001',
            unit: 'Hour',
            category: 'Services',
            productType: 'SIMPLE' as const
          }
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Generate PDF using React PDF template
    const pdfBuffer = await renderToBuffer(React.createElement(QuotationPDFTemplate, { 
      quotation: sampleQuotation, 
      settings: processedSettings 
    }))

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sample-quotation-preview.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating sample PDF:', error)
    return NextResponse.json({ 
      error: 'Failed to generate sample PDF',
      details: error.message 
    }, { status: 500 })
  }
}