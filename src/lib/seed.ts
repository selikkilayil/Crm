import { seedUsers } from './seed-users'
import { seedSettings } from './seed-settings'
import { seedSuperAdmin } from './seed-superadmin'
import { seedPermissionsAndRoles } from './seed-permissions'
import { prisma } from './prisma'

async function main() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Run all seeds in order
    await seedUsers()
    await seedSuperAdmin() 
    await seedPermissionsAndRoles()
    await seedSettings()
    
    console.log('✅ Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })