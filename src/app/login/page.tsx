'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, loginDemo } from '@/lib/auth'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const user = await login(email, password)
      console.log('Login successful, user role:', user.role)
      
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        // Redirect based on user role
        if (user.role === 'SUPERADMIN') {
          console.log('Redirecting to /superadmin')
          router.push('/superadmin')
        } else {
          console.log('Redirecting to /')
          router.push('/')
        }
      }, 100)
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Simulate a brief loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Login with demo credentials
      loginDemo()
      
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        router.push('/')
      }, 100)
    } catch (err) {
      setError('Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🏢</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            RAW
          </h2>
          <p className="mt-2 text-center text-sm text-secondary">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-900">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{ minHeight: '44px' }}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-900">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                style={{ minHeight: '44px' }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ minHeight: '44px' }}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full border-b-2 border-white w-4 h-4 mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-muted">Or</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{ minHeight: '44px' }}
            >
              Try Demo Account
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-xs text-muted space-y-1">
              <p><strong className="text-secondary">Demo Account:</strong> Full admin access with sample data</p>
              <p><strong className="text-secondary">Real Login:</strong> Use your registered email and password</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}