'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/shared/hooks'
import { hasPermission, hasAnyPermission, Permission } from '@/lib/permissions'

interface PermissionGuardProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  showFallback?: boolean
}

export default function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  showFallback = true
}: PermissionGuardProps) {
  const { user } = useAuth()
  
  if (!user) {
    return showFallback ? fallback : null
  }
  
  let hasAccess = false
  
  if (permission) {
    hasAccess = hasPermission(user.role, permission)
  } else if (permissions.length > 0) {
    hasAccess = requireAll 
      ? permissions.every(p => hasPermission(user.role, p))
      : hasAnyPermission(user.role, permissions)
  } else {
    // No permissions specified, allow access
    hasAccess = true
  }
  
  if (!hasAccess) {
    return showFallback ? fallback : null
  }
  
  return <>{children}</>
}