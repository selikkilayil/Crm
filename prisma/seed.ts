import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Hash passwords for demo users
  const demoPassword = await bcrypt.hash('DemoPassword123!', 12)
  const salesPassword = await bcrypt.hash('SalesPassword123!', 12)
  const managerPassword = await bcrypt.hash('ManagerPassword123!', 12)

  // Create sample users
  const user = await prisma.user.upsert({
    where: { email: 'demo@crm.com' },
    update: {
      password: demoPassword, // Update password if user exists
    },
    create: {
      email: 'demo@crm.com',
      name: 'Demo User',
      role: 'ADMIN',
      password: demoPassword,
      isActive: true,
    },
  })

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@crm.com' },
    update: {
      password: salesPassword,
    },
    create: {
      email: 'sales@crm.com',
      name: 'Sales User',
      role: 'SALES',
      password: salesPassword,
      isActive: true,
    },
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@crm.com' },
    update: {
      password: managerPassword,
    },
    create: {
      email: 'manager@crm.com',
      name: 'Manager User',
      role: 'MANAGER',
      password: managerPassword,
      isActive: true,
    },
  })

  // Create sample leads
  const leads = await Promise.all([
    prisma.lead.upsert({
      where: { id: 'lead-1' },
      update: {},
      create: {
        id: 'lead-1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1-555-0101',
        company: 'Tech Corp',
        status: 'NEW',
        source: 'Website',
        notes: 'Interested in premium package',
        assignedToId: salesUser.id,
      },
    }),
    prisma.lead.upsert({
      where: { id: 'lead-2' },
      update: {},
      create: {
        id: 'lead-2',
        name: 'Sarah Johnson',
        email: 'sarah@startup.com',
        phone: '+1-555-0102',
        company: 'StartupXYZ',
        status: 'CONTACTED',
        source: 'Referral',
        notes: 'Follow up next week',
        assignedToId: salesUser.id,
      },
    }),
    prisma.lead.upsert({
      where: { id: 'lead-3' },
      update: {},
      create: {
        id: 'lead-3',
        name: 'Mike Wilson',
        email: 'mike@bigcorp.com',
        phone: '+1-555-0103',
        company: 'Big Corp Inc',
        status: 'QUALIFIED',
        source: 'Cold Call',
        notes: 'Ready for proposal',
        assignedToId: managerUser.id,
      },
    }),
  ])

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'alice@company.com' },
      update: {},
      create: {
        name: 'Alice Brown',
        email: 'alice@company.com',
        phone: '+1-555-0201',
        company: 'Brown & Associates',
        billingAddress: '123 Business St, City, State 12345',
        gstin: 'GST123456789',
      },
    }),
    prisma.customer.upsert({
      where: { email: 'bob@enterprise.com' },
      update: {},
      create: {
        name: 'Bob Davis',
        email: 'bob@enterprise.com',
        phone: '+1-555-0202',
        company: 'Enterprise Solutions',
        billingAddress: '456 Corporate Ave, City, State 67890',
        gstin: 'GST987654321',
      },
    }),
  ])

  // Create sample activities
  await Promise.all([
    prisma.activity.create({
      data: {
        type: 'CALL',
        title: 'Initial Contact Call',
        description: 'Discussed requirements and pricing',
        leadId: 'lead-1',
        completedAt: new Date(),
      },
    }),
    prisma.activity.create({
      data: {
        type: 'EMAIL',
        title: 'Follow-up Email',
        description: 'Sent proposal and timeline',
        leadId: 'lead-2',
        completedAt: new Date(),
      },
    }),
    prisma.activity.create({
      data: {
        type: 'MEETING',
        title: 'Demo Meeting',
        description: 'Product demonstration scheduled',
        leadId: 'lead-3',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      },
    }),
  ])

  // Create sample tasks
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Follow up with John Smith',
        description: 'Call to discuss pricing options',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        leadId: 'lead-1',
        assignedToId: salesUser.id,
        createdById: managerUser.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Prepare proposal for StartupXYZ',
        description: 'Create detailed proposal with timeline',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        leadId: 'lead-2',
        assignedToId: salesUser.id,
        createdById: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Schedule demo with Big Corp',
        description: 'Coordinate demo meeting with stakeholders',
        status: 'COMPLETED',
        priority: 'HIGH',
        completedAt: new Date(),
        leadId: 'lead-3',
        assignedToId: managerUser.id,
        createdById: user.id,
      },
    }),
  ])

  // Create sample products
  const windowProduct = await prisma.product.create({
    data: {
      name: "UPVC Window",
      description: "High-quality UPVC windows with double glazing",
      sku: "WIN-UPVC-001",
      category: "Windows",
      productType: "CONFIGURABLE",
      pricingType: "CALCULATED",
      basePrice: 450, // Per sq ft
      costPrice: 300,
      calculationFormula: "width * height * basePrice",
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
                { value: "Wood", displayName: "Wooden", priceModifier: 200, sortOrder: 3 }
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
                { value: "Brown", displayName: "Brown", priceModifier: 50, sortOrder: 2 },
                { value: "Black", displayName: "Black", priceModifier: 75, sortOrder: 3 }
              ]
            }
          }
        ]
      }
    }
  })

  const doorProduct = await prisma.product.create({
    data: {
      name: "UPVC Door",
      description: "Premium UPVC doors with security features",
      sku: "DOOR-UPVC-001", 
      category: "Doors",
      productType: "CONFIGURABLE",
      pricingType: "CALCULATED",
      basePrice: 650, // Per sq ft
      costPrice: 450,
      calculationFormula: "width * height * basePrice + 1000", // +1000 for hardware
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
            minValue: 2.5,
            maxValue: 4,
            defaultValue: "3",
            unit: "ft"
          },
          {
            name: "Height",
            type: "NUMBER",
            isRequired: true, 
            isConfigurable: true,
            minValue: 6,
            maxValue: 8,
            defaultValue: "7",
            unit: "ft"
          },
          {
            name: "Type",
            type: "SELECT",
            isRequired: true,
            isConfigurable: true,
            options: {
              create: [
                { value: "Single", displayName: "Single Door", priceModifier: 0, sortOrder: 1 },
                { value: "Double", displayName: "Double Door", priceModifier: 800, sortOrder: 2 }
              ]
            }
          }
        ]
      }
    }
  })

  const tshirtProduct = await prisma.product.create({
    data: {
      name: "Cotton T-Shirt",
      description: "Premium cotton t-shirt with custom printing",
      sku: "TSHIRT-COT-001",
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
                { value: "XL", displayName: "Extra Large", priceModifier: 50, sortOrder: 4 }
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
                { value: "Red", displayName: "Red", priceModifier: 10, sortOrder: 3 },
                { value: "Blue", displayName: "Blue", priceModifier: 10, sortOrder: 4 }
              ]
            }
          }
        ]
      },
      variants: {
        create: [
          {
            sku: "TSHIRT-COT-001-M-WHT",
            name: "Medium White T-Shirt",
            configuration: { size: "M", color: "White" },
            price: 299,
            stock: 25
          },
          {
            sku: "TSHIRT-COT-001-L-BLK", 
            name: "Large Black T-Shirt",
            configuration: { size: "L", color: "Black" },
            price: 319,
            stock: 20
          }
        ]
      }
    }
  })

  // Create sample customers with quotations using products
  const customer1 = await prisma.customer.create({
    data: {
      name: "ABC Construction",
      email: "contact@abcconstruction.com",
      phone: "+91 98765 43210",
      company: "ABC Construction Ltd",
      billingAddress: "123 Builder Street, Construction City, State 12345",
      shippingAddress: "456 Site Avenue, Project Town, State 67890",
      gstin: "29ABCDE1234F1Z5",
      quotations: {
        create: {
          quotationNumber: "QT-2024-001",
          date: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "SENT",
          paymentTerms: "50% advance, 50% on completion",
          deliveryTerms: "15-20 working days",
          currency: "INR",
          subtotal: 18000,
          totalTax: 3240,
          grandTotal: 21240,
          notes: "Installation included in the price",
          createdById: user.id,
          items: {
            create: [
              {
                productId: windowProduct.id,
                configuration: { width: 4, height: 5, material: "UPVC", color: "White" },
                quantity: 2,
                unitPrice: 9000, // 4*5*450
                calculatedPrice: 9000,
                taxPercent: 18,
                subtotal: 18000,
                notes: "Living room windows"
              }
            ]
          }
        }
      }
    }
  })

  console.log('Sample data with Products created successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })