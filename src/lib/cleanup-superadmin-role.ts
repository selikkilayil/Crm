import { prisma } from './prisma'

/**
 * Cleanup script to remove any SUPERADMIN custom roles from the database
 * SUPERADMIN should only exist as a UserRole enum, not as a CustomRole
 */
export async function cleanupSuperAdminRole() {
  try {
    console.log('Checking for SUPERADMIN custom roles...')
    
    // Find any custom roles with SUPERADMIN name
    const superAdminRoles = await prisma.customRole.findMany({
      where: {
        name: 'SUPERADMIN'
      },
      include: {
        users: true,
        _count: {
          select: {
            users: true
          }
        }
      }
    })

    if (superAdminRoles.length === 0) {
      console.log('✅ No SUPERADMIN custom roles found. Database is clean.')
      return
    }

    console.log(`Found ${superAdminRoles.length} SUPERADMIN custom role(s)`)

    for (const role of superAdminRoles) {
      console.log(`\nProcessing role: ${role.name} (ID: ${role.id})`)
      console.log(`- Users assigned: ${role._count.users}`)
      console.log(`- Is System: ${role.isSystem}`)
      console.log(`- Is Active: ${role.isActive}`)

      if (role.users.length > 0) {
        console.log('⚠️  Warning: This role has users assigned to it!')
        console.log('Users:', role.users.map(u => `${u.name} (${u.email})`).join(', '))
        console.log('❌ Skipping deletion to prevent data loss')
        console.log('💡 Please manually reassign these users to appropriate roles first')
        continue
      }

      // Safe to delete - no users assigned
      await prisma.customRole.delete({
        where: { id: role.id }
      })
      
      console.log(`✅ Deleted SUPERADMIN custom role (ID: ${role.id})`)
    }

    console.log('\n🎉 Cleanup completed!')
    console.log('Note: SUPERADMIN users should use the UserRole.SUPERADMIN enum, not custom roles')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  cleanupSuperAdminRole()
    .then(() => {
      console.log('Cleanup process finished')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Cleanup failed:', error)
      process.exit(1)
    })
}