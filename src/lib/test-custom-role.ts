import { prisma } from './prisma'

/**
 * Test script to create a sample custom role for testing user assignment
 */
export async function createTestCustomRole() {
  try {
    console.log('Creating test custom role...')
    
    // First, get some permissions to assign to the role
    const permissions = await prisma.permission.findMany({
      take: 3 // Get first 3 permissions for testing
    })
    
    if (permissions.length === 0) {
      console.log('No permissions found in database. Cannot create test role.')
      return
    }
    
    // Create a test custom role
    const testRole = await prisma.customRole.create({
      data: {
        name: 'Marketing Specialist',
        description: 'Handles marketing campaigns and customer outreach',
        isSystem: false,
        permissions: {
          create: permissions.map(permission => ({
            permissionId: permission.id
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
    
    console.log('✅ Test custom role created successfully!')
    console.log(`Role: ${testRole.name}`)
    console.log(`Description: ${testRole.description}`)
    console.log(`Permissions: ${testRole.permissions.length}`)
    
    return testRole
    
  } catch (error) {
    console.error('❌ Error creating test custom role:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  createTestCustomRole()
    .then(() => {
      console.log('Test role creation completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Test role creation failed:', error)
      process.exit(1)
    })
}