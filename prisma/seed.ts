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

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@crm.com' },
    update: {},
    create: {
      email: 'sales@crm.com',
      name: 'Sales User',
      role: 'SALES',
    },
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@crm.com' },
    update: {},
    create: {
      email: 'manager@crm.com',
      name: 'Manager User',
      role: 'MANAGER',
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