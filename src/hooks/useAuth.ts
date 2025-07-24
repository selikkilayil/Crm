'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { getAuthToken, clearAuthToken, setAuthToken } from '@/lib/auth'

export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'SALES'
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
  
  const refreshAuth = () => {
    const token = getAuthToken()
    if (token) {
      setUser(token)
    } else {
      setUser(null)
    }
    setLoading(false)
  }
  
  useEffect(() => {
    refreshAuth()
    
    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user') {
        refreshAuth()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  const logout = () => {
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