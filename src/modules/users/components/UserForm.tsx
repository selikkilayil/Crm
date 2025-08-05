'use client'

import { useState } from 'react'
import * as Yup from 'yup'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/shared/components'
import { UserFormData, CustomRole, User } from '../types'

interface UserFormProps {
  currentUser: any
  customRoles: CustomRole[]
  onSubmit: (data: UserFormData) => Promise<void>
  onClose: () => void
  initialData?: Partial<UserFormData>
  title?: string
  submitLabel?: string
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  role: Yup.string().required('Role is required'),
  customRoleId: Yup.string().nullable(),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
})

export default function UserForm({
  currentUser,
  customRoles,
  onSubmit,
  onClose,
  initialData = {},
  title = 'Add New User',
  submitLabel = 'Create User'
}: UserFormProps) {
  const [error, setError] = useState('')
  const [useCustomRole, setUseCustomRole] = useState(false)

  const initialValues: UserFormData = {
    name: initialData.name || '',
    email: initialData.email || '',
    role: (initialData.role as User['role']) || 'SALES',
    customRoleId: initialData.customRoleId || '',
    password: '',
    confirmPassword: '',
  }

  const handleSubmit = async (values: UserFormData, { setSubmitting }: any) => {
    try {
      setError('')
      const submitData = {
        ...values,
        role: useCustomRole ? 'SALES' : values.role,
        customRoleId: useCustomRole ? values.customRoleId : undefined,
      }
      await onSubmit(submitData)
    } catch (err: any) {
      setError(err.message || 'Failed to save user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
          
          <FormWrapper
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }: any) => (
              <>
                <FormErrorMessage message={error} />
                
                <FormField name="name" label="Name" required placeholder="Full name" />
                <FormField name="email" label="Email" type="email" required placeholder="user@company.com" />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Role Type *</label>
                  
                  <div className="space-y-4">
                    {/* System Role Option */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="systemRole"
                        name="roleType"
                        checked={!useCustomRole}
                        onChange={() => {
                          setUseCustomRole(false)
                          setFieldValue('customRoleId', '')
                        }}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <label htmlFor="systemRole" className="text-sm font-medium text-gray-700">
                          System Role
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Choose from predefined system roles</p>
                        
                        {!useCustomRole && (
                          <div className="mt-3">
                            <FormField
                              name="role"
                              as="select"
                              className="w-full"
                            >
                              <option value="SALES">Sales - Can manage leads and quotations</option>
                              <option value="MANAGER">Manager - Can manage team and reports</option>
                              {currentUser?.role === 'SUPERADMIN' && (
                                <option value="ADMIN">Admin - Full system access</option>
                              )}
                            </FormField>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Custom Role Option */}
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="customRole"
                        name="roleType"
                        checked={useCustomRole}
                        onChange={() => {
                          setUseCustomRole(true)
                          setFieldValue('role', 'SALES')
                        }}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <label htmlFor="customRole" className="text-sm font-medium text-gray-700">
                          Custom Role
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Assign a custom role with specific permissions</p>
                        
                        {useCustomRole && (
                          <div className="mt-3">
                            <FormField
                              name="customRoleId"
                              as="select"
                              className="w-full"
                            >
                              <option value="">Select a custom role</option>
                              {customRoles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name} {role.description && `- ${role.description}`}
                                </option>
                              ))}
                            </FormField>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <FormField 
                  name="password" 
                  label="Password" 
                  type="password" 
                  required 
                  placeholder="Minimum 6 characters" 
                />
                <FormField 
                  name="confirmPassword" 
                  label="Confirm Password" 
                  type="password" 
                  required 
                  placeholder="Re-enter password" 
                />
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </FormButton>
                  <FormButton
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                  >
                    {submitLabel}
                  </FormButton>
                </div>
              </>
            )}
          </FormWrapper>
        </div>
      </div>
    </div>
  )
}