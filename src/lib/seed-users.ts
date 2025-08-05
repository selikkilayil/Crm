import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export async function seedUsers() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@crm.com' }
    })

    if (existingUser) {
      console.log('Users already seeded')
      return
    }

    // Create demo users with real passwords matching login page
    const users = [
      {
        id: 'user-1',
        name: 'Demo Admin',
        email: 'demo@crm.com',
        password: await bcrypt.hash('DemoPassword123!', 10),
        role: 'ADMIN' as const,
        isActive: true,
      },
      {
        id: 'user-2', 
        name: 'Manager User',
        email: 'manager@crm.com',
        password: await bcrypt.hash('ManagerPassword123!', 10),
        role: 'MANAGER' as const,
        isActive: true,
      },
      {
        id: 'user-3',
        name: 'Sales User',
        email: 'sales@crm.com', 
        password: await bcrypt.hash('SalesPassword123!', 10),
        role: 'SALES' as const,
        isActive: true,
      },
    ]

    for (const userData of users) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      })
    }

    console.log('✅ Users seeded successfully')
    console.log('Login credentials:')
    console.log('- demo@crm.com / DemoPassword123! (ADMIN)')
    console.log('- manager@crm.com / ManagerPassword123! (MANAGER)')  
    console.log('- sales@crm.com / SalesPassword123! (SALES)')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers().then(() => process.exit(0))
}