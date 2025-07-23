'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginDemo } from '@/lib/auth'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDemoLogin = async () => {
    setLoading(true)
    
    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Login with demo credentials
    loginDemo()
    
    // Redirect to dashboard
    router.push('/')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🏢</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CRM + Production
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value="demo@crm.com"
                disabled
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value="••••••••"
                disabled
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in with Demo Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              Demo credentials are automatically filled.
              <br />
              Click the button above to login instantly.
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Demo User:</strong> Admin access</p>
              <p><strong>Features:</strong> Full CRM access</p>
              <p><strong>Data:</strong> Sample data included</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}