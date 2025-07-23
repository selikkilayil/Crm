'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getAuthToken, logout } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isAuthenticated()
      setIsLoggedIn(loggedIn)
      setIsLoading(false)
      
      if (!loggedIn) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null // Will redirect to login
  }

  return <>{children}</>
}

export function useAuth() {
  const [user, setUser] = useState(getAuthToken())

  useEffect(() => {
    setUser(getAuthToken())
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    logout: () => {
      logout()
      setUser(null)
    }
  }
}