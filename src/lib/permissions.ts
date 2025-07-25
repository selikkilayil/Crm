import { UserRole } from '@prisma/client'

export interface Permission {
  resource: string
  action: string
}

export const PERMISSIONS = {
  // User management
  USERS_VIEW: { resource: 'users', action: 'view' },
  USERS_CREATE: { resource: 'users', action: 'create' },
  USERS_EDIT: { resource: 'users', action: 'edit' },
  USERS_DELETE: { resource: 'users', action: 'delete' },
  
  // Lead management
  LEADS_VIEW_ALL: { resource: 'leads', action: 'view_all' },
  LEADS_VIEW_ASSIGNED: { resource: 'leads', action: 'view_assigned' },
  LEADS_CREATE: { resource: 'leads', action: 'create' },
  LEADS_EDIT_ALL: { resource: 'leads', action: 'edit_all' },
  LEADS_EDIT_ASSIGNED: { resource: 'leads', action: 'edit_assigned' },
  LEADS_DELETE: { resource: 'leads', action: 'delete' },
  LEADS_ASSIGN: { resource: 'leads', action: 'assign' },
  
  // Customer management
  CUSTOMERS_VIEW_ALL: { resource: 'customers', action: 'view_all' },
  CUSTOMERS_VIEW_ASSIGNED: { resource: 'customers', action: 'view_assigned' },
  CUSTOMERS_CREATE: { resource: 'customers', action: 'create' },
  CUSTOMERS_EDIT_ALL: { resource: 'customers', action: 'edit_all' },
  CUSTOMERS_EDIT_ASSIGNED: { resource: 'customers', action: 'edit_assigned' },
  CUSTOMERS_DELETE: { resource: 'customers', action: 'delete' },
  
  // Task management
  TASKS_VIEW_ALL: { resource: 'tasks', action: 'view_all' },
  TASKS_VIEW_ASSIGNED: { resource: 'tasks', action: 'view_assigned' },
  TASKS_CREATE: { resource: 'tasks', action: 'create' },
  TASKS_EDIT_ALL: { resource: 'tasks', action: 'edit_all' },
  TASKS_EDIT_ASSIGNED: { resource: 'tasks', action: 'edit_assigned' },
  TASKS_DELETE: { resource: 'tasks', action: 'delete' },
  TASKS_ASSIGN: { resource: 'tasks', action: 'assign' },
  
  // Activity management
  ACTIVITIES_VIEW_ALL: { resource: 'activities', action: 'view_all' },
  ACTIVITIES_VIEW_ASSIGNED: { resource: 'activities', action: 'view_assigned' },
  ACTIVITIES_CREATE: { resource: 'activities', action: 'create' },
  ACTIVITIES_EDIT_ALL: { resource: 'activities', action: 'edit_all' },
  ACTIVITIES_EDIT_ASSIGNED: { resource: 'activities', action: 'edit_assigned' },
  ACTIVITIES_DELETE: { resource: 'activities', action: 'delete' },
  
  // Tag management
  TAGS_VIEW: { resource: 'tags', action: 'view' },
  TAGS_CREATE: { resource: 'tags', action: 'create' },
  TAGS_EDIT: { resource: 'tags', action: 'edit' },
  TAGS_DELETE: { resource: 'tags', action: 'delete' },
  
  // Quotation management
  QUOTATIONS_VIEW_ALL: { resource: 'quotations', action: 'view_all' },
  QUOTATIONS_VIEW_ASSIGNED: { resource: 'quotations', action: 'view_assigned' },
  QUOTATIONS_CREATE: { resource: 'quotations', action: 'create' },
  QUOTATIONS_EDIT_ALL: { resource: 'quotations', action: 'edit_all' },
  QUOTATIONS_EDIT_ASSIGNED: { resource: 'quotations', action: 'edit_assigned' },
  QUOTATIONS_DELETE: { resource: 'quotations', action: 'delete' },
  QUOTATIONS_SEND: { resource: 'quotations', action: 'send' },
  
  // Dashboard and analytics
  DASHBOARD_VIEW_ALL: { resource: 'dashboard', action: 'view_all' },
  DASHBOARD_VIEW_TEAM: { resource: 'dashboard', action: 'view_team' },
  DASHBOARD_VIEW_PERSONAL: { resource: 'dashboard', action: 'view_personal' },
} as const

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPERADMIN: [
    // Only user management permissions for superadmin
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
  ],
  
  ADMIN: [
    // Full access to everything
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    
    PERMISSIONS.LEADS_VIEW_ALL,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_EDIT_ALL,
    PERMISSIONS.LEADS_DELETE,
    PERMISSIONS.LEADS_ASSIGN,
    
    PERMISSIONS.CUSTOMERS_VIEW_ALL,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT_ALL,
    PERMISSIONS.CUSTOMERS_DELETE,
    
    PERMISSIONS.TASKS_VIEW_ALL,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT_ALL,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.TASKS_ASSIGN,
    
    PERMISSIONS.ACTIVITIES_VIEW_ALL,
    PERMISSIONS.ACTIVITIES_CREATE,
    PERMISSIONS.ACTIVITIES_EDIT_ALL,
    PERMISSIONS.ACTIVITIES_DELETE,
    
    PERMISSIONS.TAGS_VIEW,
    PERMISSIONS.TAGS_CREATE,
    PERMISSIONS.TAGS_EDIT,
    PERMISSIONS.TAGS_DELETE,
    
    PERMISSIONS.QUOTATIONS_VIEW_ALL,
    PERMISSIONS.QUOTATIONS_CREATE,
    PERMISSIONS.QUOTATIONS_EDIT_ALL,
    PERMISSIONS.QUOTATIONS_DELETE,
    PERMISSIONS.QUOTATIONS_SEND,
    
    PERMISSIONS.DASHBOARD_VIEW_ALL,
  ],
  
  MANAGER: [
    // Can view users but not manage them
    PERMISSIONS.USERS_VIEW,
    
    // Full access to leads, customers, tasks, activities
    PERMISSIONS.LEADS_VIEW_ALL,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_EDIT_ALL,
    PERMISSIONS.LEADS_ASSIGN,
    
    PERMISSIONS.CUSTOMERS_VIEW_ALL,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT_ALL,
    
    PERMISSIONS.TASKS_VIEW_ALL,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT_ALL,
    PERMISSIONS.TASKS_ASSIGN,
    
    PERMISSIONS.ACTIVITIES_VIEW_ALL,
    PERMISSIONS.ACTIVITIES_CREATE,
    PERMISSIONS.ACTIVITIES_EDIT_ALL,
    
    PERMISSIONS.TAGS_VIEW,
    PERMISSIONS.TAGS_CREATE,
    PERMISSIONS.TAGS_EDIT,
    
    PERMISSIONS.QUOTATIONS_VIEW_ALL,
    PERMISSIONS.QUOTATIONS_CREATE,
    PERMISSIONS.QUOTATIONS_EDIT_ALL,
    PERMISSIONS.QUOTATIONS_SEND,
    
    PERMISSIONS.DASHBOARD_VIEW_TEAM,
  ],
  
  SALES: [
    // Limited access - only assigned items and personal data
    PERMISSIONS.LEADS_VIEW_ASSIGNED,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_EDIT_ASSIGNED,
    
    PERMISSIONS.CUSTOMERS_VIEW_ASSIGNED,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT_ASSIGNED,
    
    PERMISSIONS.TASKS_VIEW_ASSIGNED,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT_ASSIGNED,
    
    PERMISSIONS.ACTIVITIES_VIEW_ASSIGNED,
    PERMISSIONS.ACTIVITIES_CREATE,
    PERMISSIONS.ACTIVITIES_EDIT_ASSIGNED,
    
    PERMISSIONS.TAGS_VIEW,
    
    PERMISSIONS.QUOTATIONS_VIEW_ASSIGNED,
    PERMISSIONS.QUOTATIONS_CREATE,
    PERMISSIONS.QUOTATIONS_EDIT_ASSIGNED,
    PERMISSIONS.QUOTATIONS_SEND,
    
    PERMISSIONS.DASHBOARD_VIEW_PERSONAL,
  ],
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.some(
    p => p.resource === permission.resource && p.action === permission.action
  )
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

export function canAccessResource(userRole: UserRole, resource: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.some(p => p.resource === resource)
}

export function getResourceActions(userRole: UserRole, resource: string): string[] {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions
    .filter(p => p.resource === resource)
    .map(p => p.action)
}