import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasPermission, Permission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
}

export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Try to get user from localStorage data (passed via headers by client)
    const authHeader = request.headers.get('x-auth-user')
    
    if (!authHeader) {
      return null
    }
    
    let userData: { id: string } | null = null
    
    try {
      userData = JSON.parse(authHeader)
    } catch {
      return null
    }
    
    if (!userData?.id) {
      return null
    }
    
    // Fetch fresh user data from database to ensure it's current
    const user = await prisma.user.findUnique({
      where: { id: userData.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    })
    
    if (!user || !user.isActive) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requirePermission(
  request: NextRequest, 
  permission: Permission
): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  
  if (!hasPermission(user.role, permission)) {
    throw new Error('Insufficient permissions')
  }
  
  return user
}

export async function requireRole(
  request: NextRequest, 
  roles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  
  if (!roles.includes(user.role)) {
    throw new Error('Insufficient role permissions')
  }
  
  return user
}

export function getDataFilter(userRole: UserRole, userId: string) {
  switch (userRole) {
    case 'ADMIN':
      // Admin can see everything
      return {}
      
    case 'MANAGER':
      // Manager can see everything (but with some restrictions in permissions)
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