import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
const JWT_EXPIRES_IN = '24h'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: string
  permissions?: string[]
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export function generateAccessToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    // Fallback to cookie if no Authorization header
    if (!token) {
      token = request.cookies.get('auth-token')?.value || null
    }

    if (!token) {
      return null
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return null
    }

    // Fetch current user data from database to ensure user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isArchived: true,
        customRoleId: true,
        customRole: {
          select: {
            permissions: {
              select: {
                permission: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user || !user.isActive || user.isArchived) {
      return null
    }

    // Get user permissions
    const permissions: string[] = []
    if (user.customRole?.permissions) {
      permissions.push(...user.customRole.permissions.map(p => p.permission.name))
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await authenticateRequest(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export function hasPermission(user: AuthenticatedUser, requiredPermission: string): boolean {
  // SUPERADMIN has all permissions except CRM access (as per business rules)
  if (user.role === 'SUPERADMIN') {
    // SUPERADMIN only has access to user management
    return requiredPermission.startsWith('USER_') || requiredPermission.startsWith('ROLE_')
  }

  // ADMIN has all CRM permissions
  if (user.role === 'ADMIN') {
    return !requiredPermission.startsWith('USER_') && !requiredPermission.startsWith('ROLE_')
  }

  // Check custom role permissions
  return user.permissions?.includes(requiredPermission) || false
}

export async function requirePermission(request: NextRequest, permission: string): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  
  if (!hasPermission(user, permission)) {
    throw new Error(`Insufficient permissions. Required: ${permission}`)
  }

  return user
}