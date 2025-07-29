const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugPermissions() {
  try {
    console.log('🔍 Checking permissions setup...\n')
    
    // 1. Check if product permissions exist
    const productPermissions = await prisma.permission.findMany({
      where: {
        resource: 'products'
      }
    })
    
    console.log('📦 Product Permissions in Database:')
    productPermissions.forEach(p => {
      console.log(`  - ${p.resource}:${p.action} - ${p.description}`)
    })
    console.log()
    
    // 2. Check Administrator role
    const adminRole = await prisma.customRole.findFirst({
      where: {
        name: 'Administrator',
        isSystem: true
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
    
    if (adminRole) {
      console.log('👑 Administrator Role Permissions:')
      const productPerms = adminRole.permissions.filter(rp => 
        rp.permission.resource === 'products'
      )
      
      if (productPerms.length > 0) {
        productPerms.forEach(rp => {
          console.log(`  ✅ ${rp.permission.resource}:${rp.permission.action}`)
        })
      } else {
        console.log('  ❌ No product permissions found for Administrator role!')
      }
    } else {
      console.log('❌ Administrator role not found!')
    }
    console.log()
    
    // 3. Check demo admin user
    const demoUser = await prisma.user.findUnique({
      where: {
        email: 'demo@crm.com'
      },
      include: {
        customRole: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })
    
    if (demoUser) {
      console.log('👤 Demo User Details:')
      console.log(`  - Email: ${demoUser.email}`)
      console.log(`  - Role: ${demoUser.role}`)
      console.log(`  - Custom Role ID: ${demoUser.customRoleId}`)
      
      if (demoUser.customRole) {
        console.log(`  - Custom Role Name: ${demoUser.customRole.name}`)
        const productPerms = demoUser.customRole.permissions.filter(rp => 
          rp.permission.resource === 'products'
        )
        
        if (productPerms.length > 0) {
          console.log('  ✅ Has product permissions via custom role:')
          productPerms.forEach(rp => {
            console.log(`    - ${rp.permission.resource}:${rp.permission.action}`)
          })
        } else {
          console.log('  ❌ No product permissions via custom role!')
        }
      } else {
        console.log('  - Using hardcoded role permissions')
      }
    } else {
      console.log('❌ Demo user not found!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugPermissions()