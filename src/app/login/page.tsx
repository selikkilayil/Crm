'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Yup from 'yup'
import { login } from '@/lib/auth'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/components/forms'

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
})

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const initialValues: LoginFormValues = {
    email: '',
    password: ''
  }

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true)
    setError('')
    
    try {
      const user = await login(values.email, values.password)
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

  const handleTestLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Use the demo account credentials
      const user = await login('demo@crm.com', 'DemoPassword123!')
      console.log('Test login successful, user role:', user.role)
      
      // Small delay to ensure auth is updated
      setTimeout(() => {
        if (user.role === 'SUPERADMIN') {
          router.push('/superadmin')
        } else {
          router.push('/')
        }
      }, 100)
    } catch (err) {
      console.error('Test login error:', err)
      setError(err instanceof Error ? err.message : 'Test login failed')
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
        
        <FormWrapper
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
          className="mt-8"
        >
          <FormErrorMessage message={error} />
          
          <FormField
            name="email"
            label="Email address"
            type="email"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
          
          <FormField
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            disabled={loading}
          />

          <div className="space-y-4">
            <FormButton
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              loading={loading}
              className="w-full min-h-[44px]"
            >
              Sign in
            </FormButton>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or</span>
              </div>
            </div>
            
            <FormButton
              type="button"
              variant="secondary"
              size="md"
              onClick={handleTestLogin}
              disabled={loading}
              loading={loading}
              className="w-full min-h-[44px]"
            >
              Try Demo Account
            </FormButton>
          </div>
        </FormWrapper>

        <div className="pt-4">
          <div className="text-xs text-gray-500 space-y-2">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900 mb-1">Demo Accounts:</p>
              <div className="space-y-1">
                <p className="text-blue-800"><strong>Admin:</strong> <code>demo@crm.com</code> / <code>DemoPassword123!</code></p>
                <p className="text-blue-800"><strong>Sales:</strong> <code>sales@crm.com</code> / <code>SalesPassword123!</code></p>
                <p className="text-blue-800"><strong>Manager:</strong> <code>manager@crm.com</code> / <code>ManagerPassword123!</code></p>
              </div>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p className="font-semibold text-amber-900 mb-1">SuperAdmin Access:</p>
              <p className="text-amber-800">Email: <code>superadmin@crm.internal</code></p>
              <p className="text-amber-800">Password: <code>SecureAdmin2025!</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}