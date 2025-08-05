'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/shared/hooks'
import { useRouter, useParams } from 'next/navigation'
import { AuthGuard } from '@/shared/components'
import { NavBar } from '@/shared/components'
import apiClient from '@/shared/services'

interface Permission {
  id: string
  resource: string
  action: string
  description?: string
  category?: string
}

interface Role {
  id: string
  name: string
  description?: string
  isSystem: boolean
  isActive: boolean
  userCount: number
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export default function EditRolePage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string
  
  const [role, setRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({})
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Only allow ADMIN and SUPERADMIN users to access this page
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      router.push('/roles')
      return
    }
    
    if (user && roleId) {
      fetchRole()
      fetchPermissions()
    }
  }, [user, router, roleId])

  const fetchRole = async () => {
    try {
      const data = await apiClient.get(`/api/roles/${roleId}`) as Role
      setRole(data)
      setFormData({
        name: data.name,
        description: data.description || '',
      })
      setSelectedPermissions(data.permissions.map(p => p.id))
    } catch (error) {
      console.error('Error fetching role:', error)
      setError('Failed to load role')
    }
  }

  const fetchPermissions = async () => {
    try {
      const data = await apiClient.get('/api/permissions') as any
      setPermissions(data.permissions || [])
      setGroupedPermissions(data.groupedPermissions || {})
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setError('Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleCategoryToggle = (category: string) => {
    const categoryPermissions = groupedPermissions[category]?.map(p => p.id) || []
    const allSelected = categoryPermissions.every(id => selectedPermissions.includes(id))
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !categoryPermissions.includes(id)))
    } else {
      setSelectedPermissions(prev => [...new Set([...prev, ...categoryPermissions])])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.name.trim()) {
      setError('Role name is required')
      return
    }
    
    if (selectedPermissions.length === 0) {
      setError('Please select at least one permission')
      return
    }

    setSubmitting(true)

    try {
      await apiClient.put(`/api/roles/${roleId}`, {
        name: formData.name,
        description: formData.description,
        permissionIds: selectedPermissions,
      })
      
      router.push('/roles')
    } catch (error) {
      console.error('Error updating role:', error)
      setError('Failed to update role')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <NavBar currentPage="roles" />
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!role) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <NavBar currentPage="roles" />
          <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Role Not Found</h1>
              <button
                onClick={() => router.push('/roles')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Roles
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="roles" />
        
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Role</h1>
                <p className="mt-2 text-gray-600">Modify role permissions and details</p>
                {role.isSystem && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      System Role
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push('/roles')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Roles
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={role.isSystem}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      role.isSystem ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="e.g., Marketing Team"
                  />
                  {role.isSystem && (
                    <p className="mt-1 text-xs text-gray-500">System role names cannot be changed</p>
                  )}
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Optional description"
                  />
                </div>
              </div>
            </div>

            {/* Role Statistics */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Role Statistics</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{role.userCount}</div>
                  <div className="text-sm text-gray-600">Users Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedPermissions.length}</div>
                  <div className="text-sm text-gray-600">Permissions</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${role.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {role.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Permissions ({selectedPermissions.length} selected)
                </h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions(permissions.map(p => p.id))}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions([])}
                    className="text-sm text-gray-600 hover:text-gray-500"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Loading permissions...
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-medium text-gray-900 capitalize">{category}</h3>
                        <button
                          type="button"
                          onClick={() => handleCategoryToggle(category)}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          {categoryPermissions.every(p => selectedPermissions.includes(p.id))
                            ? 'Deselect All'
                            : 'Select All'
                          }
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {categoryPermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="relative flex items-start py-2 cursor-pointer hover:bg-gray-50 rounded px-2"
                          >
                            <div className="flex items-center h-5">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <span className="font-medium text-gray-900">
                                {permission.resource}:{permission.action}
                              </span>
                              {permission.description && (
                                <p className="text-gray-500 text-xs mt-0.5">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/roles')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}