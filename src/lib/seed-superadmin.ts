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

    // Generate a secure random password
    const defaultPassword = process.env.SUPERADMIN_PASSWORD || `TempPass${Date.now()}!`
    const hashedPassword = await bcrypt.hash(defaultPassword, 12)
    
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
    console.log('Password:', defaultPassword)
    
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