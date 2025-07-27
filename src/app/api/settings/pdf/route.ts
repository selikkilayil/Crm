import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/settings/pdf - Get PDF settings
export async function GET() {
  try {
    // Try to get existing settings, or create default if none exist
    let settings = await prisma.pDFSettings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.pDFSettings.create({
        data: {
          // Default values are already set in the schema
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching PDF settings:', error)
    return NextResponse.json({ error: 'Failed to fetch PDF settings' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/settings/pdf - Update PDF settings
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Get existing settings or create new one
    let settings = await prisma.pDFSettings.findFirst()
    
    if (settings) {
      // Update existing settings
      settings = await prisma.pDFSettings.update({
        where: { id: settings.id },
        data: {
          companyName: data.companyName,
          companyAddress: data.companyAddress,
          companyPhone: data.companyPhone,
          companyEmail: data.companyEmail,
          companyWebsite: data.companyWebsite,
          companyGST: data.companyGST,
          logoUrl: data.logoUrl,
          logoText: data.logoText,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          textColor: data.textColor,
          lightBackground: data.lightBackground,
          quotationPrefix: data.quotationPrefix,
          quotationNumberFormat: data.quotationNumberFormat,
          defaultValidityDays: data.defaultValidityDays,
          defaultTermsConditions: data.defaultTermsConditions,
          defaultPaymentTerms: data.defaultPaymentTerms,
          defaultDeliveryTerms: data.defaultDeliveryTerms,
          defaultTaxRate: data.defaultTaxRate,
          showTaxBreakdown: data.showTaxBreakdown,
          defaultCurrency: data.defaultCurrency,
          currencySymbol: data.currencySymbol,
          footerText: data.footerText,
        }
      })
    } else {
      // Create new settings
      settings = await prisma.pDFSettings.create({
        data: {
          companyName: data.companyName,
          companyAddress: data.companyAddress,
          companyPhone: data.companyPhone,
          companyEmail: data.companyEmail,
          companyWebsite: data.companyWebsite,
          companyGST: data.companyGST,
          logoUrl: data.logoUrl,
          logoText: data.logoText,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          textColor: data.textColor,
          lightBackground: data.lightBackground,
          quotationPrefix: data.quotationPrefix,
          quotationNumberFormat: data.quotationNumberFormat,
          defaultValidityDays: data.defaultValidityDays,
          defaultTermsConditions: data.defaultTermsConditions,
          defaultPaymentTerms: data.defaultPaymentTerms,
          defaultDeliveryTerms: data.defaultDeliveryTerms,
          defaultTaxRate: data.defaultTaxRate,
          showTaxBreakdown: data.showTaxBreakdown,
          defaultCurrency: data.defaultCurrency,
          currencySymbol: data.currencySymbol,
          footerText: data.footerText,
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating PDF settings:', error)
    return NextResponse.json({ error: 'Failed to update PDF settings' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}