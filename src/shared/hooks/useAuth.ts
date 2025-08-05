'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { getAuthToken, clearAuthToken, setAuthToken, logout } from '@/shared/services'

export interface User {
  id: string
  email: string
  name: string
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES'
  customRoleId?: string | null
  customRole?: {
    id: string
    name: string
    description?: string
  } | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
  updateUser: (user: User) => void
  isAuthenticated: boolean
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const refreshAuth = async () => {
    try {
      // First check localStorage for cached user data
      const cachedUser = getAuthToken()
      if (cachedUser) {
        setUser(cachedUser)
      }

      // Then verify with server using JWT cookie
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Include HTTP-only cookies
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
          // Update localStorage cache
          setAuthToken(data.user)
        }
      } else {
        // If server says not authenticated, clear local state
        setUser(null)
        clearAuthToken()
      }
    } catch (error) {
      console.error('Auth refresh error:', error)
      // On network error, fall back to cached user if available
      const cachedUser = getAuthToken()
      if (cachedUser) {
        setUser(cachedUser)
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    refreshAuth()
    
    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user') {
        refreshAuth()
      }
    }

    // Also refresh auth on window focus (in case cookie expired)
    const handleWindowFocus = () => {
      // Only refresh if we think we're authenticated
      if (getAuthToken()) {
        refreshAuth()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleWindowFocus)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [])
  
  const logout = async () => {
    try {
      // Call server logout to clear HTTP-only cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout API error:', error)
    }
    
    // Clear client-side state
    clearAuthToken()
    setUser(null)
    window.location.href = '/login'
  }
  
  const updateUser = (updatedUser: User) => {
    setAuthToken(updatedUser)
    setUser(updatedUser)
  }
  
  return {
    user,
    loading,
    logout,
    updateUser,
    isAuthenticated: !!user,
    refreshAuth
  }
}