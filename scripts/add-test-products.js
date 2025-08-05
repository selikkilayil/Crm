const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addTestProducts() {
  console.log('Adding test products for quotation testing...')

  try {
    // 1. Simple Fixed Price Product
    const laptop = await prisma.product.create({
      data: {
        name: "Business Laptop",
        description: "Professional laptop for business use",
        sku: "LAPTOP-BUS-001",
        category: "Electronics",
        productType: "SIMPLE",
        pricingType: "FIXED",
        basePrice: 45000,
        costPrice: 35000,
        trackInventory: true,
        currentStock: 25,
        minStockLevel: 5,
        unit: "piece",
        defaultTaxRate: 18,
      }
    })

    // 2. Configurable T-Shirt with Size/Color Options
    const tshirt = await prisma.product.create({
      data: {
        name: "Custom T-Shirt",
        description: "Premium cotton t-shirt with custom printing options",
        sku: "TSHIRT-CUSTOM-001",
        category: "Apparel",
        productType: "CONFIGURABLE",
        pricingType: "VARIANT_BASED",
        basePrice: 299,
        costPrice: 150,
        trackInventory: true,
        currentStock: 100,
        minStockLevel: 20,
        unit: "piece",
        defaultTaxRate: 12,
        attributes: {
          create: [
            {
              name: "Size",
              type: "SELECT",
              isRequired: true,
              isConfigurable: true,
              options: {
                create: [
                  { value: "S", displayName: "Small", priceModifier: -20, sortOrder: 1 },
                  { value: "M", displayName: "Medium", priceModifier: 0, sortOrder: 2 },
                  { value: "L", displayName: "Large", priceModifier: 20, sortOrder: 3 },
                  { value: "XL", displayName: "Extra Large", priceModifier: 50, sortOrder: 4 },
                  { value: "XXL", displayName: "Double XL", priceModifier: 100, sortOrder: 5 }
                ]
              }
            },
            {
              name: "Color",
              type: "SELECT",
              isRequired: true,
              isConfigurable: true,
              options: {
                create: [
                  { value: "White", displayName: "White", priceModifier: 0, sortOrder: 1 },
                  { value: "Black", displayName: "Black", priceModifier: 0, sortOrder: 2 },
                  { value: "Red", displayName: "Red", priceModifier: 25, sortOrder: 3 },
                  { value: "Blue", displayName: "Blue", priceModifier: 25, sortOrder: 4 },
                  { value: "Green", displayName: "Green", priceModifier: 25, sortOrder: 5 }
                ]
              }
            },
            {
              name: "Print Type",
              type: "SELECT",
              isRequired: false,
              isConfigurable: true,
              options: {
                create: [
                  { value: "None", displayName: "No Print", priceModifier: 0, sortOrder: 1 },
                  { value: "Text", displayName: "Text Print", priceModifier: 50, sortOrder: 2 },
                  { value: "Logo", displayName: "Logo Print", priceModifier: 100, sortOrder: 3 },
                  { value: "Full", displayName: "Full Design", priceModifier: 200, sortOrder: 4 }
                ]
              }
            }
          ]
        },
        variants: {
          create: [
            {
              sku: "TSHIRT-CUSTOM-001-M-WHT",
              name: "Medium White T-Shirt",
              configuration: { size: "M", color: "White", printType: "None" },
              price: 299,
              stock: 25
            },
            {
              sku: "TSHIRT-CUSTOM-001-L-BLK", 
              name: "Large Black T-Shirt",
              configuration: { size: "L", color: "Black", printType: "None" },
              price: 319,
              stock: 20
            }
          ]
        }
      }
    })

    // 3. Calculated Price Product (Area-based)
    const flooring = await prisma.product.create({
      data: {
        name: "Premium Vinyl Flooring",
        description: "High-quality vinyl flooring with installation",
        sku: "FLOOR-VINYL-001",
        category: "Flooring",
        productType: "CALCULATED",
        pricingType: "CALCULATED",
        basePrice: 850, // Per sq ft
        costPrice: 600,
        calculationFormula: "length * width * basePrice",
        trackInventory: false,
        unit: "sqft",
        defaultTaxRate: 18,
        attributes: {
          create: [
            {
              name: "Length",
              type: "NUMBER",
              isRequired: true,
              isConfigurable: true,
              minValue: 5,
              maxValue: 50,
              defaultValue: "10",
              unit: "ft"
            },
            {
              name: "Width",
              type: "NUMBER",
              isRequired: true,
              isConfigurable: true,
              minValue: 5,
              maxValue: 30,
              defaultValue: "12",
              unit: "ft"
            },
            {
              name: "Quality",
              type: "SELECT",
              isRequired: true,
              isConfigurable: true,
              options: {
                create: [
                  { value: "Standard", displayName: "Standard Quality", priceModifier: 0, sortOrder: 1 },
                  { value: "Premium", displayName: "Premium Quality", priceModifier: 200, sortOrder: 2 },
                  { value: "Luxury", displayName: "Luxury Quality", priceModifier: 400, sortOrder: 3 }
                ]
              }
            }
          ]
        }
      }
    })

    // 4. Window Product (Complex Calculated)
    const window = await prisma.product.create({
      data: {
        name: "UPVC Window",
        description: "High-quality UPVC windows with double glazing",
        sku: "WIN-UPVC-002",
        category: "Windows",
        productType: "CONFIGURABLE",
        pricingType: "CALCULATED",
        basePrice: 450, // Per sq ft
        costPrice: 300,
        calculationFormula: "width * height * basePrice + 500", // +500 for hardware
        trackInventory: false,
        unit: "sqft",
        defaultTaxRate: 18,
        attributes: {
          create: [
            {
              name: "Width",
              type: "NUMBER",
              isRequired: true,
              isConfigurable: true,
              minValue: 2,
              maxValue: 10,
              defaultValue: "4",
              unit: "ft"
            },
            {
              name: "Height", 
              type: "NUMBER",
              isRequired: true,
              isConfigurable: true,
              minValue: 2,
              maxValue: 8,
              defaultValue: "4",
              unit: "ft"
            },
            {
              name: "Material",
              type: "SELECT",
              isRequired: true,
              isConfigurable: true,
              options: {
                create: [
                  { value: "UPVC", displayName: "UPVC", priceModifier: 0, sortOrder: 1 },
                  { value: "Aluminum", displayName: "Aluminum", priceModifier: 100, sortOrder: 2 },
                  { value: "Wood", displayName: "Wooden", priceModifier: 250, sortOrder: 3 }
                ]
              }
            },
            {
              name: "Glass",
              type: "SELECT",
              isRequired: true,
              isConfigurable: true,
              options: {
                create: [
                  { value: "Single", displayName: "Single Glazing", priceModifier: 0, sortOrder: 1 },
                  { value: "Double", displayName: "Double Glazing", priceModifier: 150, sortOrder: 2 },
                  { value: "Triple", displayName: "Triple Glazing", priceModifier: 300, sortOrder: 3 }
                ]
              }
            },
            {
              name: "Color",
              type: "SELECT",
              isRequired: false,
              isConfigurable: true,
              options: {
                create: [
                  { value: "White", displayName: "White", priceModifier: 0, sortOrder: 1 },
                  { value: "Brown", displayName: "Brown", priceModifier: 75, sortOrder: 2 },
                  { value: "Black", displayName: "Black", priceModifier: 100, sortOrder: 3 }
                ]
              }
            }
          ]
        }
      }
    })

    // 5. Service Product (Per Unit)
    const installation = await prisma.product.create({
      data: {
        name: "Installation Service",
        description: "Professional installation service",
        sku: "SERVICE-INSTALL-001",
        category: "Services",
        productType: "SIMPLE",
        pricingType: "PER_UNIT",
        basePrice: 500, // Per hour
        costPrice: 300,
        trackInventory: false,
        unit: "hour",
        defaultTaxRate: 18,
        attributes: {
          create: [
            {
              name: "Hours",
              type: "NUMBER",
              isRequired: true,
              isConfigurable: true,
              minValue: 1,
              maxValue: 24,
              defaultValue: "4",
              unit: "hours"
            },
            {
              name: "Complexity",
              type: "SELECT",
              isRequired: true,
              isConfigurable: true,
              options: {
                create: [
                  { value: "Simple", displayName: "Simple Installation", priceModifier: 0, sortOrder: 1 },
                  { value: "Standard", displayName: "Standard Installation", priceModifier: 100, sortOrder: 2 },
                  { value: "Complex", displayName: "Complex Installation", priceModifier: 250, sortOrder: 3 }
                ]
              }
            }
          ]
        }
      }
    })

    // 6. Software License (Fixed with variants)
    const software = await prisma.product.create({
      data: {
        name: "CRM Software License",
        description: "Annual software license with different user tiers",
        sku: "SOFTWARE-CRM-001",
        category: "Software",
        productType: "CONFIGURABLE",
        pricingType: "VARIANT_BASED",
        basePrice: 12000, // Base annual price
        costPrice: 2000,
        trackInventory: false,
        unit: "license",
        defaultTaxRate: 18,
        attributes: {
          create: [
            {
              name: "Users",
              type: "SELECT",
              isRequired: true,
              isConfigurable: true,
              options: {
                create: [
                  { value: "5", displayName: "Up to 5 Users", priceModifier: 0, sortOrder: 1 },
                  { value: "10", displayName: "Up to 10 Users", priceModifier: 8000, sortOrder: 2 },
                  { value: "25", displayName: "Up to 25 Users", priceModifier: 18000, sortOrder: 3 },
                  { value: "50", displayName: "Up to 50 Users", priceModifier: 35000, sortOrder: 4 }
                ]
              }
            },
            {
              name: "Support",
              type: "SELECT",
              isRequired: true,
              isConfigurable: true,
              options: {
                create: [
                  { value: "Basic", displayName: "Basic Support", priceModifier: 0, sortOrder: 1 },
                  { value: "Premium", displayName: "Premium Support", priceModifier: 5000, sortOrder: 2 },
                  { value: "Enterprise", displayName: "Enterprise Support", priceModifier: 12000, sortOrder: 3 }
                ]
              }
            }
          ]
        },
        variants: {
          create: [
            {
              sku: "SOFTWARE-CRM-001-5U-BASIC",
              name: "CRM License - 5 Users Basic",
              configuration: { users: "5", support: "Basic" },
              price: 12000,
              stock: null
            },
            {
              sku: "SOFTWARE-CRM-001-10U-PREMIUM",
              name: "CRM License - 10 Users Premium",
              configuration: { users: "10", support: "Premium" },
              price: 25000,
              stock: null
            }
          ]
        }
      }
    })

    console.log('✅ Test products added successfully!')
    console.log(`Created products:`)
    console.log(`1. ${laptop.name} (${laptop.sku}) - Fixed Price: ₹${laptop.basePrice}`)
    console.log(`2. ${tshirt.name} (${tshirt.sku}) - Configurable with variants`)
    console.log(`3. ${flooring.name} (${flooring.sku}) - Calculated by area`)
    console.log(`4. ${window.name} (${window.sku}) - Complex calculated pricing`)
    console.log(`5. ${installation.name} (${installation.sku}) - Per unit service`)
    console.log(`6. ${software.name} (${software.sku}) - Variant-based licensing`)

  } catch (error) {
    console.error('Error adding test products:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestProducts()