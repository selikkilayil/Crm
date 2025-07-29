import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Define all available permissions
const PERMISSIONS = [
  // User Management
  { resource: 'users', action: 'view_all', description: 'View all users', category: 'Admin' },
  { resource: 'users', action: 'create', description: 'Create new users', category: 'Admin' },
  { resource: 'users', action: 'edit', description: 'Edit user details', category: 'Admin' },
  { resource: 'users', action: 'delete', description: 'Delete users', category: 'Admin' },
  
  // Role Management  
  { resource: 'roles', action: 'view', description: 'View roles', category: 'Admin' },
  { resource: 'roles', action: 'create', description: 'Create new roles', category: 'Admin' },
  { resource: 'roles', action: 'edit', description: 'Edit role permissions', category: 'Admin' },
  { resource: 'roles', action: 'delete', description: 'Delete roles', category: 'Admin' },
  
  // Lead Management
  { resource: 'leads', action: 'view_all', description: 'View all leads', category: 'CRM' },
  { resource: 'leads', action: 'view_assigned', description: 'View assigned leads only', category: 'CRM' },
  { resource: 'leads', action: 'create', description: 'Create new leads', category: 'CRM' },
  { resource: 'leads', action: 'edit_all', description: 'Edit all leads', category: 'CRM' },
  { resource: 'leads', action: 'edit_assigned', description: 'Edit assigned leads only', category: 'CRM' },
  { resource: 'leads', action: 'delete', description: 'Delete leads', category: 'CRM' },
  { resource: 'leads', action: 'assign', description: 'Assign leads to users', category: 'CRM' },
  
  // Customer Management
  { resource: 'customers', action: 'view_all', description: 'View all customers', category: 'CRM' },
  { resource: 'customers', action: 'view_assigned', description: 'View assigned customers only', category: 'CRM' },
  { resource: 'customers', action: 'create', description: 'Create new customers', category: 'CRM' },
  { resource: 'customers', action: 'edit_all', description: 'Edit all customers', category: 'CRM' },
  { resource: 'customers', action: 'edit_assigned', description: 'Edit assigned customers only', category: 'CRM' },
  { resource: 'customers', action: 'delete', description: 'Delete customers', category: 'CRM' },
  
  // Quotation Management
  { resource: 'quotations', action: 'view_all', description: 'View all quotations', category: 'CRM' },
  { resource: 'quotations', action: 'view_assigned', description: 'View assigned quotations only', category: 'CRM' },
  { resource: 'quotations', action: 'create', description: 'Create new quotations', category: 'CRM' },
  { resource: 'quotations', action: 'edit_all', description: 'Edit all quotations', category: 'CRM' },
  { resource: 'quotations', action: 'edit_assigned', description: 'Edit assigned quotations only', category: 'CRM' },
  { resource: 'quotations', action: 'delete', description: 'Delete quotations', category: 'CRM' },
  { resource: 'quotations', action: 'send', description: 'Send quotations to customers', category: 'CRM' },
  
  // Task Management
  { resource: 'tasks', action: 'view_all', description: 'View all tasks', category: 'CRM' },
  { resource: 'tasks', action: 'view_assigned', description: 'View assigned tasks only', category: 'CRM' },
  { resource: 'tasks', action: 'create', description: 'Create new tasks', category: 'CRM' },
  { resource: 'tasks', action: 'edit_all', description: 'Edit all tasks', category: 'CRM' },
  { resource: 'tasks', action: 'edit_assigned', description: 'Edit assigned tasks only', category: 'CRM' },
  { resource: 'tasks', action: 'delete', description: 'Delete tasks', category: 'CRM' },
  { resource: 'tasks', action: 'assign', description: 'Assign tasks to users', category: 'CRM' },
  
  // Activity Management
  { resource: 'activities', action: 'view_all', description: 'View all activities', category: 'CRM' },
  { resource: 'activities', action: 'view_assigned', description: 'View assigned activities only', category: 'CRM' },
  { resource: 'activities', action: 'create', description: 'Create new activities', category: 'CRM' },
  { resource: 'activities', action: 'edit_all', description: 'Edit all activities', category: 'CRM' },
  { resource: 'activities', action: 'edit_assigned', description: 'Edit assigned activities only', category: 'CRM' },
  { resource: 'activities', action: 'delete', description: 'Delete activities', category: 'CRM' },
  
  // Tag Management
  { resource: 'tags', action: 'view', description: 'View tags', category: 'CRM' },
  { resource: 'tags', action: 'create', description: 'Create new tags', category: 'CRM' },
  { resource: 'tags', action: 'edit', description: 'Edit tags', category: 'CRM' },
  { resource: 'tags', action: 'delete', description: 'Delete tags', category: 'CRM' },
  
  // Product Management
  { resource: 'products', action: 'view', description: 'View products catalog', category: 'Inventory' },
  { resource: 'products', action: 'create', description: 'Create new products', category: 'Inventory' },
  { resource: 'products', action: 'edit', description: 'Edit product details', category: 'Inventory' },
  { resource: 'products', action: 'delete', description: 'Delete products', category: 'Inventory' },
  
  // Dashboard & Reports
  { resource: 'dashboard', action: 'view_all', description: 'View all dashboard data', category: 'Reports' },
  { resource: 'dashboard', action: 'view_team', description: 'View team dashboard data', category: 'Reports' },
  { resource: 'dashboard', action: 'view_personal', description: 'View personal dashboard data', category: 'Reports' },
]

// Define system roles that mirror the existing hardcoded roles
const SYSTEM_ROLES = [
  {
    name: 'Super Administrator',
    description: 'Full system access with user management only',
    isSystem: true,
    permissions: ['users:view_all', 'users:create', 'users:edit', 'users:delete', 'roles:view', 'roles:create', 'roles:edit', 'roles:delete']
  },
  {
    name: 'Administrator', 
    description: 'Full access to all CRM features and user management',
    isSystem: true,
    permissions: [
      'users:view_all', 'users:create', 'users:edit', 'users:delete',
      'leads:view_all', 'leads:create', 'leads:edit_all', 'leads:delete', 'leads:assign',
      'customers:view_all', 'customers:create', 'customers:edit_all', 'customers:delete',
      'products:view', 'products:create', 'products:edit', 'products:delete',
      'quotations:view_all', 'quotations:create', 'quotations:edit_all', 'quotations:delete', 'quotations:send',
      'tasks:view_all', 'tasks:create', 'tasks:edit_all', 'tasks:delete', 'tasks:assign',
      'activities:view_all', 'activities:create', 'activities:edit_all', 'activities:delete',
      'tags:view', 'tags:create', 'tags:edit', 'tags:delete',
      'dashboard:view_all'
    ]
  },
  {
    name: 'Manager',
    description: 'Team management with full CRM access',
    isSystem: true,
    permissions: [
      'users:view_all',
      'leads:view_all', 'leads:create', 'leads:edit_all', 'leads:assign',
      'customers:view_all', 'customers:create', 'customers:edit_all',
      'products:view', 'products:create', 'products:edit',
      'quotations:view_all', 'quotations:create', 'quotations:edit_all', 'quotations:send',
      'tasks:view_all', 'tasks:create', 'tasks:edit_all', 'tasks:assign',
      'activities:view_all', 'activities:create', 'activities:edit_all',
      'tags:view', 'tags:create', 'tags:edit',
      'dashboard:view_team'
    ]
  },
  {
    name: 'Sales Representative',
    description: 'Basic CRM access with assigned items only',
    isSystem: true,
    permissions: [
      'leads:view_assigned', 'leads:create', 'leads:edit_assigned',
      'customers:view_assigned', 'customers:create', 'customers:edit_assigned',
      'products:view',
      'quotations:view_assigned', 'quotations:create', 'quotations:edit_assigned', 'quotations:send',
      'tasks:view_assigned', 'tasks:create', 'tasks:edit_assigned',
      'activities:view_assigned', 'activities:create', 'activities:edit_assigned',
      'tags:view',
      'dashboard:view_personal'
    ]
  }
]

export async function seedPermissionsAndRoles() {
  try {
    console.log('🌱 Seeding permissions and roles...')
    
    // 1. Create all permissions
    console.log('Creating permissions...')
    for (const perm of PERMISSIONS) {
      await prisma.permission.upsert({
        where: { 
          resource_action: { 
            resource: perm.resource, 
            action: perm.action 
          } 
        },
        update: { 
          description: perm.description,
          category: perm.category 
        },
        create: perm
      })
    }
    
    // 2. Create system roles
    console.log('Creating system roles...')
    for (const role of SYSTEM_ROLES) {
      const createdRole = await prisma.customRole.upsert({
        where: { name: role.name },
        update: { 
          description: role.description,
          isSystem: role.isSystem 
        },
        create: {
          name: role.name,
          description: role.description,
          isSystem: role.isSystem
        }
      })
      
      // Clear existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: createdRole.id }
      })
      
      // Add permissions to role
      for (const permissionKey of role.permissions) {
        const [resource, action] = permissionKey.split(':')
        const permission = await prisma.permission.findUnique({
          where: { resource_action: { resource, action } }
        })
        
        if (permission) {
          await prisma.rolePermission.create({
            data: {
              roleId: createdRole.id,
              permissionId: permission.id
            }
          })
        }
      }
    }
    
    console.log('✅ Permissions and roles seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding permissions and roles:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedPermissionsAndRoles()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}