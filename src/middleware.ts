import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for login page, public assets, and API auth
  if (
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/logout') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Authenticate the request
  const user = await authenticateRequest(request)
  
  if (!user) {
    // Redirect to login for page routes
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Return 401 for API routes
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // SUPERADMIN role restrictions
  if (user.role === 'SUPERADMIN') {
    const allowedPaths = ['/users', '/superadmin', '/api/users', '/api/roles', '/api/permissions']
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path))
    
    if (!isAllowed) {
      if (!pathname.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/users', request.url))
      }
      return NextResponse.json({ error: 'Unauthorized: Superadmin access restricted to user management' }, { status: 403 })
    }
  }

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