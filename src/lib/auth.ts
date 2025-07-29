export interface User {
  id: string
  email: string
  name: string
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES'
  customRoleId?: string
  customRole?: {
    id: string
    name: string
    description: string
  }
}

let currentUser: User | null = null

export function setAuthToken(user: User) {
  currentUser = user
  // Store user info in localStorage for client-side access
  // The actual token is stored in HTTP-only cookie
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }
}

export function getAuthToken(): User | null {
  if (currentUser) {
    return currentUser
  }
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      try {
        currentUser = JSON.parse(stored)
        return currentUser
      } catch {
        return null
      }
    }
  }
  return null
}

export function clearAuthToken() {
  currentUser = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user')
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Include cookies for authentication
    })

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text()
      console.error('Non-JSON response:', textResponse)
      throw new Error('Server error - please try again')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    setAuthToken(data.user)
    return data.user
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Network error - please check your connection')
  }
}

export async function logout() {
  try {
    // Call logout API to clear HTTP-only cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies
    })
  } catch (error) {
    console.error('Logout API call failed:', error)
    // Continue with client-side cleanup even if API fails
  }
  
  clearAuthToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}