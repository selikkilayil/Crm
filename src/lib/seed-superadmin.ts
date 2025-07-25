import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export async function seedSuperAdmin() {
  try {
    // Check if superadmin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    })

    if (existingSuperAdmin) {
      console.log('SuperAdmin already exists')
      return existingSuperAdmin
    }

    // Create superadmin user
    const hashedPassword = await bcrypt.hash('SuperAdmin@123!', 10)
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@crm.internal',
        name: 'Super Administrator',
        role: 'SUPERADMIN',
        password: hashedPassword,
        isActive: true,
      }
    })

    console.log('SuperAdmin created successfully')
    console.log('Email: superadmin@crm.internal')
    console.log('Password: SuperAdmin@123!')
    
    return superAdmin
  } catch (error) {
    console.error('Error seeding superadmin:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedSuperAdmin()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}