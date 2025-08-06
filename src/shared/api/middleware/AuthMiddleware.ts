import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthContext {
  user: AuthenticatedUser
  isAuthenticated: true
}

export interface UnauthenticatedContext {
  user: null
  isAuthenticated: false
}

export type RequestContext = AuthContext | UnauthenticatedContext

export class AuthMiddleware {
  static async authenticate(request: NextRequest): Promise<{
    success: boolean
    user?: AuthenticatedUser
    error?: string
  }> {
    try {
      const authHeader = request.headers.get('x-auth-user')
      
      if (!authHeader) {
        return {
          success: false,
          error: 'No authentication header provided'
        }
      }

      const user = await getAuthenticatedUser(request)
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid authentication credentials'
        }
      }

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return {
        success: false,
        error: 'Authentication failed'
      }
    }
  }

  static async requireAuth(
    request: NextRequest,
    handler: (context: AuthContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const authResult = await AuthMiddleware.authenticate(request)
    
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required' },
        { status: 401 }
      )
    }

    const context: AuthContext = {
      user: authResult.user,
      isAuthenticated: true
    }

    return handler(context)
  }

  static async optionalAuth(
    request: NextRequest,
    handler: (context: RequestContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const authResult = await AuthMiddleware.authenticate(request)
    
    const context: RequestContext = authResult.success && authResult.user
      ? { user: authResult.user, isAuthenticated: true }
      : { user: null, isAuthenticated: false }

    return handler(context)
  }
}