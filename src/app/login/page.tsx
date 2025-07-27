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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            RAW
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
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
              <label htmlFor="email" className="form-label form-label-required">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="form-input"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="form-label form-label-required">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner loading-spinner-sm mr-2 border-white"></div>
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
                <span className="px-2 bg-gray-50 text-gray-500">Or</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="btn btn-secondary w-full"
            >
              Try Demo Account
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Demo Account:</strong> Full admin access with sample data</p>
              <p><strong>Real Login:</strong> Use your registered email and password</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}