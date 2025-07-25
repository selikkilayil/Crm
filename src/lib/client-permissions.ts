import { UserRole } from '@prisma/client'

export interface Permission {
  resource: string
  action: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  customRoleId?: string | null
}

// Client-side permission checking (simplified version for navigation)
// For detailed permission checking, use the server-side dynamic-permissions.ts

export function canAccessResource(userRole: UserRole, resource: string): boolean {
  // For now, use hardcoded logic for navigation
  // This could be enhanced to fetch user's actual permissions from API
  
  switch (userRole) {
    case 'SUPERADMIN':
      // Superadmin can only access users and roles
      return ['users', 'roles'].includes(resource)
      
    case 'ADMIN':
      // Admin can access everything
      return true
      
    case 'MANAGER':
      // Manager can access most things except user management
      return !['users', 'roles'].includes(resource)
      
    case 'SALES':
      // Sales can access basic CRM features
      return ['leads', 'customers', 'quotations', 'tasks', 'activities', 'tags', 'dashboard'].includes(resource)
      
    default:
      return false
  }
}

// Enhanced version that could work with custom roles (future enhancement)
export async function canAccessResourceAsync(user: User, resource: string): Promise<boolean> {
  // If user has a custom role, we'd need to fetch their permissions
  if (user.customRoleId) {
    try {
      const response = await fetch(`/api/users/${user.id}/permissions`)
      if (response.ok) {
        const permissions = await response.json()
        return permissions.some((p: Permission) => p.resource === resource)
      }
    } catch (error) {
      console.error('Failed to fetch user permissions:', error)
    }
  }
  
  // Fall back to hardcoded role-based permissions
  return canAccessResource(user.role, resource)
}

// Get permissions for hardcoded roles (for backwards compatibility)
export function getHardcodedRolePermissions(role: UserRole): Permission[] {
  switch (role) {
    case 'SUPERADMIN':
      return [
        { resource: 'users', action: 'view_all' },
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'edit' },
        { resource: 'users', action: 'delete' },
        { resource: 'roles', action: 'view' },
        { resource: 'roles', action: 'create' },
        { resource: 'roles', action: 'edit' },
        { resource: 'roles', action: 'delete' },
      ]
    
    case 'ADMIN':
      return [
        { resource: 'users', action: 'view_all' },
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'edit' },
        { resource: 'users', action: 'delete' },
        { resource: 'roles', action: 'view' },
        { resource: 'roles', action: 'create' },
        { resource: 'roles', action: 'edit' },
        { resource: 'roles', action: 'delete' },
        { resource: 'leads', action: 'view_all' },
        { resource: 'customers', action: 'view_all' },
        { resource: 'quotations', action: 'view_all' },
        { resource: 'tasks', action: 'view_all' },
        { resource: 'activities', action: 'view_all' },
        { resource: 'tags', action: 'view' },
        { resource: 'dashboard', action: 'view_all' },
      ]
    
    case 'MANAGER':
      return [
        { resource: 'users', action: 'view_all' },
        { resource: 'leads', action: 'view_all' },
        { resource: 'customers', action: 'view_all' },
        { resource: 'quotations', action: 'view_all' },
        { resource: 'tasks', action: 'view_all' },
        { resource: 'activities', action: 'view_all' },
        { resource: 'tags', action: 'view' },
        { resource: 'dashboard', action: 'view_team' },
      ]
    
    case 'SALES':
      return [
        { resource: 'leads', action: 'view_assigned' },
        { resource: 'customers', action: 'view_assigned' },
        { resource: 'quotations', action: 'view_assigned' },
        { resource: 'tasks', action: 'view_assigned' },
        { resource: 'activities', action: 'view_assigned' },
        { resource: 'tags', action: 'view' },
        { resource: 'dashboard', action: 'view_personal' },
      ]
    
    default:
      return []
  }
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = getHardcodedRolePermissions(userRole)
  return rolePermissions.some(
    p => p.resource === permission.resource && p.action === permission.action
  )
}