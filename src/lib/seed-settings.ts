import { prisma } from './prisma'

export async function seedSettings() {
  try {
    // Check if settings already exist
    const existingSettings = await prisma.pDFSettings.findFirst()

    if (existingSettings) {
      console.log('📄 PDF Settings already seeded')
      return
    }

    // Create default PDF settings
    await prisma.pDFSettings.create({
      data: {
        // Company Information
        companyName: "Your Company Name",
        companyAddress: "123 Business Street\nBusiness City, State 12345\nCountry",
        companyPhone: "+1 (555) 123-4567",
        companyEmail: "info@yourcompany.com",
        companyWebsite: "www.yourcompany.com",
        companyGST: "12ABCDE3456F1Z5",
        
        // Logo Settings
        logoText: "YC",
        
        // Color Scheme
        primaryColor: "#2563eb",
        secondaryColor: "#7c3aed",
        textColor: "#1f2937",
        lightBackground: "#f8fafc",
        
        // Quotation Settings
        quotationPrefix: "QT",
        quotationNumberFormat: "QT-YYYY-####",
        defaultValidityDays: 30,
        
        // Default Terms and Conditions
        defaultTermsConditions: "1. Prices are valid for the period mentioned above.\n2. Payment terms as agreed upon.\n3. Delivery will be made as per agreed schedule.\n4. All disputes are subject to local jurisdiction.\n5. Terms and conditions may be subject to change.",
        
        // Payment & Delivery Terms
        defaultPaymentTerms: "50% advance, 50% on delivery",
        defaultDeliveryTerms: "Delivery within 7-14 business days",
        
        // Tax Settings
        defaultTaxRate: 18.00,
        showTaxBreakdown: true,
        
        // Currency Settings
        defaultCurrency: "USD",
        currencySymbol: "$",
        
        // Footer
        footerText: "Thank you for choosing our services!",
      }
    })

    console.log('✅ PDF Settings seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding PDF settings:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedSettings()
    .then(() => {
      console.log('🌱 Settings seed completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Settings seed failed:', error)
      process.exit(1)
    })
}