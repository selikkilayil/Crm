export interface User {
  id: string
  email: string
  name: string
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES'
}

const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@crm.com',
  name: 'Demo User',
  role: 'ADMIN'
}

export function setAuthToken(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }
}

export function getAuthToken(): User | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
  }
  return null
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user')
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

export function loginDemo(): User {
  setAuthToken(DEMO_USER)
  return DEMO_USER
}

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Login failed')
  }

  setAuthToken(data.user)
  return data.user
}

export function logout() {
  clearAuthToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}