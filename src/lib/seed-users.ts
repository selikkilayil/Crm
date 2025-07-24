import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export async function seedUsers() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@crm.com' }
    })

    if (existingUser) {
      console.log('Users already seeded')
      return
    }

    // Create demo users with real passwords
    const users = [
      {
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@crm.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN' as const,
        isActive: true,
      },
      {
        id: 'user-2', 
        name: 'Manager User',
        email: 'manager@crm.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'MANAGER' as const,
        isActive: true,
      },
      {
        id: 'user-3',
        name: 'Sales User',
        email: 'sales@crm.com', 
        password: await bcrypt.hash('sales123', 10),
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
    console.log('- admin@crm.com / admin123 (ADMIN)')
    console.log('- manager@crm.com / manager123 (MANAGER)')  
    console.log('- sales@crm.com / sales123 (SALES)')
  } catch (error) {
    console.error('❌ Error seeding users:', error)
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers().then(() => process.exit(0))
}