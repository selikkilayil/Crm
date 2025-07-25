import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/leads',
  '/customers',
  '/activities', 
  '/tasks',
  '/tags',
  '/users',
  '/quotations',
  '/api/leads',
  '/api/customers',
  '/api/activities',
  '/api/tasks',
  '/api/tags',
  '/api/users',
  '/api/quotations',
]

// Routes that require admin access
const adminOnlyRoutes = [
  '/users',
  '/api/users',
]

// Routes that require superadmin access
const superAdminOnlyRoutes = [
  '/superadmin',
]

// Routes that require manager or admin access
const managerRoutes = [
  '/dashboard',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for login page, public assets, and API auth
  if (
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/auth/login') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Special handling for superadmin route
  if (pathname === '/superadmin') {
    return NextResponse.next()
  }
  
  // For now, disable middleware redirects for client-side routes
  // Let the client-side AuthGuard handle authentication
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Superadmin API access restrictions - block access to non-user APIs
  const authHeader = request.headers.get('x-auth-user')
  if (authHeader) {
    try {
      const userData = JSON.parse(authHeader)
      // Check if this appears to be a superadmin user (basic check)
      // Full verification happens in individual API routes
      if (userData.role === 'SUPERADMIN') {
        // Only allow access to user management APIs
        if (!pathname.startsWith('/api/users') && pathname !== '/api/auth/login') {
          return NextResponse.json({ error: 'Unauthorized: Superadmin access restricted' }, { status: 403 })
        }
      }
    } catch {
      // Invalid auth header, let individual routes handle
    }
  }
  
  // Only handle API route protection
  const isProtectedApiRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) && pathname.startsWith('/api/')
  )
  
  if (!isProtectedApiRoute) {
    return NextResponse.next()
  }
  
  // For API routes, let individual route handlers manage auth
  // since they need to access user data anyway
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}