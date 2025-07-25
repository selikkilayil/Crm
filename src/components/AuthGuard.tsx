'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (loading || hasRedirected) return

    if (!isAuthenticated) {
      setHasRedirected(true)
      router.push('/login')
      return
    }

    if (user) {
      const currentPath = window.location.pathname
      
      // Superadmin can only access /superadmin route
      if (user.role === 'SUPERADMIN') {
        if (currentPath !== '/superadmin') {
          setHasRedirected(true)
          router.push('/superadmin')
        }
      } else {
        // Regular users cannot access /superadmin
        if (currentPath === '/superadmin') {
          setHasRedirected(true)
          router.push('/')
        }
      }
    }
  }, [loading, isAuthenticated, user, router, hasRedirected])

  // Reset redirect flag when path changes
  useEffect(() => {
    const handleRouteChange = () => setHasRedirected(false)
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return <>{children}</>
}

// Remove the useAuth hook from here - use the one in hooks/useAuth.ts instead