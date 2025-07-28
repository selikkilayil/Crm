import { prisma } from './prisma'

/**
 * Debug script to check what roles are in the database and what the API should return
 */
export async function debugRolesApi() {
  try {
    console.log('=== DEBUGGING ROLES API ===\n')
    
    // Check all custom roles in database
    console.log('1. ALL CustomRoles in database:')
    const allRoles = await prisma.customRole.findMany({
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    if (allRoles.length === 0) {
      console.log('   No custom roles found in database')
    } else {
      allRoles.forEach(role => {
        console.log(`   - ${role.name} (ID: ${role.id})`)
        console.log(`     Active: ${role.isActive}, System: ${role.isSystem}, Users: ${role._count.users}`)
      })
    }
    
    console.log('\n2. Roles that WOULD be returned by API (filtered):')
    const filteredRoles = await prisma.customRole.findMany({
      where: { 
        isActive: true,
        isSystem: false,
        name: { not: 'SUPERADMIN' }
      },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    if (filteredRoles.length === 0) {
      console.log('   No roles match the API filter criteria')
    } else {
      filteredRoles.forEach(role => {
        console.log(`   - ${role.name} (ID: ${role.id})`)
        console.log(`     Active: ${role.isActive}, System: ${role.isSystem}, Users: ${role._count.users}`)
      })
    }
    
    console.log('\n3. Users with SUPERADMIN role (enum):')
    const superAdminUsers = await prisma.user.findMany({
      where: {
        role: 'SUPERADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    })
    
    if (superAdminUsers.length === 0) {
      console.log('   No users with SUPERADMIN role found')
    } else {
      superAdminUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Active: ${user.isActive}`)
      })
    }
    
    console.log('\n=== DEBUG COMPLETE ===')
    
  } catch (error) {
    console.error('❌ Error during debug:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  debugRolesApi()
    .then(() => {
      console.log('Debug process finished')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Debug failed:', error)
      process.exit(1)
    })
}