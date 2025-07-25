import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export interface Permission {
  resource: string
  action: string
}

export interface UserWithPermissions {
  id: string
  email: string
  name: string
  role: UserRole
  customRoleId?: string | null
  isActive: boolean
}

// Cache for user permissions (in-memory cache for performance)
const permissionCache = new Map<string, Permission[]>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  permissions: Permission[]
  timestamp: number
}

function getCacheKey(userId: string): string {
  return `user_permissions_${userId}`
}

function isValidCacheEntry(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL
}

// Get permissions for a user (combines hardcoded + custom roles)
export async function getUserPermissions(user: UserWithPermissions): Promise<Permission[]> {
  const cacheKey = getCacheKey(user.id)
  const cachedEntry = permissionCache.get(cacheKey) as CacheEntry | undefined
  
  if (cachedEntry && isValidCacheEntry(cachedEntry)) {
    return cachedEntry.permissions
  }

  let permissions: Permission[] = []

  // If user has a custom role, get permissions from database
  if (user.customRoleId) {
    try {
      const customRole = await prisma.customRole.findUnique({
        where: { 
          id: user.customRoleId,
          isActive: true 
        },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      })

      if (customRole) {
        permissions = customRole.permissions.map(rp => ({
          resource: rp.permission.resource,
          action: rp.permission.action
        }))
      }
    } catch (error) {
      console.error('Error fetching custom role permissions:', error)
      // Fall back to hardcoded role permissions
    }
  }

  // If no custom role or failed to fetch, use hardcoded role permissions
  if (permissions.length === 0) {
    permissions = getHardcodedRolePermissions(user.role)
  }

  // Cache the result
  permissionCache.set(cacheKey, {
    permissions,
    timestamp: Date.now()
  })

  return permissions
}

// Hardcoded role permissions (fallback)
function getHardcodedRolePermissions(role: UserRole): Permission[] {
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
        { resource: 'leads', action: 'create' },
        { resource: 'leads', action: 'edit_all' },
        { resource: 'leads', action: 'delete' },
        { resource: 'leads', action: 'assign' },
        { resource: 'customers', action: 'view_all' },
        { resource: 'customers', action: 'create' },
        { resource: 'customers', action: 'edit_all' },
        { resource: 'customers', action: 'delete' },
        { resource: 'quotations', action: 'view_all' },
        { resource: 'quotations', action: 'create' },
        { resource: 'quotations', action: 'edit_all' },
        { resource: 'quotations', action: 'delete' },
        { resource: 'quotations', action: 'send' },
        { resource: 'tasks', action: 'view_all' },
        { resource: 'tasks', action: 'create' },
        { resource: 'tasks', action: 'edit_all' },
        { resource: 'tasks', action: 'delete' },
        { resource: 'tasks', action: 'assign' },
        { resource: 'activities', action: 'view_all' },
        { resource: 'activities', action: 'create' },
        { resource: 'activities', action: 'edit_all' },
        { resource: 'activities', action: 'delete' },
        { resource: 'tags', action: 'view' },
        { resource: 'tags', action: 'create' },
        { resource: 'tags', action: 'edit' },
        { resource: 'tags', action: 'delete' },
        { resource: 'dashboard', action: 'view_all' },
      ]
    
    case 'MANAGER':
      return [
        { resource: 'users', action: 'view_all' },
        { resource: 'leads', action: 'view_all' },
        { resource: 'leads', action: 'create' },
        { resource: 'leads', action: 'edit_all' },
        { resource: 'leads', action: 'assign' },
        { resource: 'customers', action: 'view_all' },
        { resource: 'customers', action: 'create' },
        { resource: 'customers', action: 'edit_all' },
        { resource: 'quotations', action: 'view_all' },
        { resource: 'quotations', action: 'create' },
        { resource: 'quotations', action: 'edit_all' },
        { resource: 'quotations', action: 'send' },
        { resource: 'tasks', action: 'view_all' },
        { resource: 'tasks', action: 'create' },
        { resource: 'tasks', action: 'edit_all' },
        { resource: 'tasks', action: 'assign' },
        { resource: 'activities', action: 'view_all' },
        { resource: 'activities', action: 'create' },
        { resource: 'activities', action: 'edit_all' },
        { resource: 'tags', action: 'view' },
        { resource: 'tags', action: 'create' },
        { resource: 'tags', action: 'edit' },
        { resource: 'dashboard', action: 'view_team' },
      ]
    
    case 'SALES':
      return [
        { resource: 'leads', action: 'view_assigned' },
        { resource: 'leads', action: 'create' },
        { resource: 'leads', action: 'edit_assigned' },
        { resource: 'customers', action: 'view_assigned' },
        { resource: 'customers', action: 'create' },
        { resource: 'customers', action: 'edit_assigned' },
        { resource: 'quotations', action: 'view_assigned' },
        { resource: 'quotations', action: 'create' },
        { resource: 'quotations', action: 'edit_assigned' },
        { resource: 'quotations', action: 'send' },
        { resource: 'tasks', action: 'view_assigned' },
        { resource: 'tasks', action: 'create' },
        { resource: 'tasks', action: 'edit_assigned' },
        { resource: 'activities', action: 'view_assigned' },
        { resource: 'activities', action: 'create' },
        { resource: 'activities', action: 'edit_assigned' },
        { resource: 'tags', action: 'view' },
        { resource: 'dashboard', action: 'view_personal' },
      ]
    
    default:
      return []
  }
}

// Check if user has a specific permission
export async function hasPermission(user: UserWithPermissions, permission: Permission): Promise<boolean> {
  const userPermissions = await getUserPermissions(user)
  return userPermissions.some(p => p.resource === permission.resource && p.action === permission.action)
}

// Check if user has any of the given permissions
export async function hasAnyPermission(user: UserWithPermissions, permissions: Permission[]): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(user, permission)) {
      return true
    }
  }
  return false
}

// Check if user has all the given permissions
export async function hasAllPermissions(user: UserWithPermissions, permissions: Permission[]): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(user, permission))) {
      return false
    }
  }
  return true
}

// Check if user can access a resource (has any permission for that resource)
export async function canAccessResource(user: UserWithPermissions, resource: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(user)
  return userPermissions.some(p => p.resource === resource)
}

// Get all actions user can perform on a resource
export async function getResourceActions(user: UserWithPermissions, resource: string): Promise<string[]> {
  const userPermissions = await getUserPermissions(user)
  return userPermissions
    .filter(p => p.resource === resource)
    .map(p => p.action)
}

// Clear permissions cache for a user (call when user role changes)
export function clearUserPermissionsCache(userId: string): void {
  const cacheKey = getCacheKey(userId)
  permissionCache.delete(cacheKey)
}

// Clear all permissions cache
export function clearAllPermissionsCache(): void {
  permissionCache.clear()
}

// Data filter for queries (same logic as before but works with new permissions)
export function getDataFilter(userRole: UserRole, userId: string) {
  switch (userRole) {
    case 'SUPERADMIN':
      // Superadmin has no access to CRM data, only user management
      return { id: 'no-access' }
      
    case 'ADMIN':
    case 'MANAGER':
      // Admin and Manager can see everything
      return {}
      
    case 'SALES':
      // Sales can only see assigned items
      return {
        OR: [
          { assignedToId: userId },
          { createdById: userId },
        ],
      }
      
    default:
      // Default to most restrictive
      return {
        OR: [
          { assignedToId: userId },
          { createdById: userId },
        ],
      }
  }
}