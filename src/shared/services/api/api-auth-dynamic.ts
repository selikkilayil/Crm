import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  getUserPermissions, 
  hasPermission, 
  Permission, 
  UserWithPermissions,
  getDataFilter 
} from '@/lib/dynamic-permissions'
import { UserRole } from '@prisma/client'

export async function getAuthenticatedUser(request: NextRequest): Promise<UserWithPermissions | null> {
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
        customRoleId: true,
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

export async function requireAuth(request: NextRequest): Promise<UserWithPermissions> {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requirePermission(
  request: NextRequest, 
  permission: Permission
): Promise<UserWithPermissions> {
  const user = await requireAuth(request)
  
  const hasRequiredPermission = await hasPermission(user, permission)
  if (!hasRequiredPermission) {
    throw new Error('Insufficient permissions')
  }
  
  return user
}

export async function requireRole(
  request: NextRequest, 
  roles: UserRole[]
): Promise<UserWithPermissions> {
  const user = await requireAuth(request)
  
  if (!roles.includes(user.role)) {
    throw new Error('Insufficient role permissions')
  }
  
  return user
}

// Export the data filter function for backwards compatibility
export { getDataFilter }