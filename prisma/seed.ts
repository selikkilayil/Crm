import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const user = await prisma.user.upsert({
    where: { email: 'demo@crm.com' },
    update: {},
    create: {
      email: 'demo@crm.com',
      name: 'Demo User',
      role: 'ADMIN',
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

  console.log('Sample data created successfully!')
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