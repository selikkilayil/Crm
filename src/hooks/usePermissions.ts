import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface Permission {
  resource: string
  action: string
}

export function usePermissions() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserPermissions()
    } else {
      setPermissions([])
      setLoading(false)
    }
  }, [user])

  const fetchUserPermissions = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-auth-user': JSON.stringify(user)
      }

      const response = await fetch(`/api/users/${user.id}/permissions`, { headers })
      
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions || [])
      } else {
        // Fall back to hardcoded permissions if API fails
        setPermissions(getHardcodedPermissions(user.role, user.customRoleId))
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error)
      // Fall back to hardcoded permissions
      setPermissions(getHardcodedPermissions(user.role, user.customRoleId))
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (resource: string, action?: string): boolean => {
    if (!user || loading) return false
    
    // Check if user has the specific permission
    return permissions.some(permission => {
      if (action) {
        return permission.resource === resource && permission.action === action
      } else {
        // If no action specified, check if user has any permission for the resource
        return permission.resource === resource
      }
    })
  }

  const canAccessResource = (resource: string): boolean => {
    if (!user || loading) return false
    
    // Check based on resource type
    switch (resource) {
      case 'users':
        return hasPermission('users', 'view_all') || user.role === 'SUPERADMIN'
      case 'roles':
        return hasPermission('roles', 'view') || user.role === 'SUPERADMIN'
      case 'leads':
        return hasPermission('leads', 'view_all') || hasPermission('leads', 'view_assigned')
      case 'customers':
        return hasPermission('customers', 'view_all') || hasPermission('customers', 'view_assigned')
      case 'products':
        return hasPermission('products', 'view')
      case 'quotations':
        return hasPermission('quotations', 'view_all') || hasPermission('quotations', 'view_assigned')
      case 'tasks':
        return hasPermission('tasks', 'view_all') || hasPermission('tasks', 'view_assigned')
      case 'activities':
        return hasPermission('activities', 'view_all') || hasPermission('activities', 'view_assigned')
      case 'tags':
        return hasPermission('tags', 'view')
      case 'settings':
        return hasPermission('settings', 'view') || user.role === 'ADMIN' || user.role === 'SUPERADMIN'
      case 'dashboard':
        return hasPermission('dashboard', 'view_all') || 
               hasPermission('dashboard', 'view_team') || 
               hasPermission('dashboard', 'view_personal')
      default:
        return false
    }
  }

  return {
    permissions,
    loading,
    hasPermission,
    canAccessResource
  }
}

// Fallback to hardcoded permissions if dynamic permissions fail
function getHardcodedPermissions(role: string, customRoleId?: string | null): Permission[] {
  // If user has custom role, we can't determine permissions without DB access
  // Return empty array to force proper API usage
  if (customRoleId) {
    console.warn('Cannot determine custom role permissions in fallback mode')
    return []
  }

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
        { resource: 'leads', action: 'view_all' },
        { resource: 'customers', action: 'view_all' },
        { resource: 'products', action: 'view' },
        { resource: 'products', action: 'create' },
        { resource: 'products', action: 'edit' },
        { resource: 'products', action: 'delete' },
        { resource: 'quotations', action: 'view_all' },
        { resource: 'tasks', action: 'view_all' },
        { resource: 'activities', action: 'view_all' },
        { resource: 'tags', action: 'view' },
        { resource: 'settings', action: 'view' },
        { resource: 'dashboard', action: 'view_all' }
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
        { resource: 'products', action: 'view' },
        { resource: 'products', action: 'create' },
        { resource: 'products', action: 'edit' },
        { resource: 'products', action: 'delete' },
        { resource: 'quotations', action: 'view_all' },
        { resource: 'tasks', action: 'view_all' },
        { resource: 'activities', action: 'view_all' },
        { resource: 'tags', action: 'view' },
        { resource: 'settings', action: 'view' },
        { resource: 'dashboard', action: 'view_all' }
      ]
    case 'MANAGER':
      return [
        { resource: 'leads', action: 'view_all' },
        { resource: 'customers', action: 'view_all' },
        { resource: 'products', action: 'view' },
        { resource: 'products', action: 'create' },
        { resource: 'products', action: 'edit' },
        { resource: 'quotations', action: 'view_all' },
        { resource: 'tasks', action: 'view_all' },
        { resource: 'activities', action: 'view_all' },
        { resource: 'tags', action: 'view' },
        { resource: 'dashboard', action: 'view_team' }
      ]
    case 'SALES':
      return [
        { resource: 'leads', action: 'view_assigned' },
        { resource: 'customers', action: 'view_assigned' },
        { resource: 'products', action: 'view' },
        { resource: 'quotations', action: 'view_assigned' },
        { resource: 'tasks', action: 'view_assigned' },
        { resource: 'activities', action: 'view_assigned' },
        { resource: 'tags', action: 'view' },
        { resource: 'dashboard', action: 'view_personal' }
      ]
    default:
      return []
  }
}