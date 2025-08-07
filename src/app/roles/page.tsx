'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useConfirm } from '@/lib/confirmation-context'
import AuthGuard from '@/components/AuthGuard'
import LayoutWithVerticalNav from '@/components/LayoutWithVerticalNav'
import apiClient from '@/lib/api-client'

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

export default function RolesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const confirm = useConfirm()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRoles()
    }
  }, [user])

  const fetchRoles = async () => {
    try {
      const data = await apiClient.get('/api/roles')
      if (Array.isArray(data)) {
        setRoles(data)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteRole = async (roleId: string) => {
    const result = await confirm({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this role? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete'
    })
    
    if (!result) return

    try {
      await apiClient.delete(`/api/roles/${roleId}`)
      fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      alert('Failed to delete role')
    }
  }

  const handleEditRole = (role: Role) => {
    router.push(`/roles/edit/${role.id}`)
  }

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    try {
      await apiClient.put(`/api/roles/${roleId}`, { isActive: !isActive })
      fetchRoles()
    } catch (error) {
      console.error('Error toggling role:', error)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <LayoutWithVerticalNav currentPage="roles">
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </LayoutWithVerticalNav>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <LayoutWithVerticalNav currentPage="roles">
        
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                <p className="text-gray-600">Manage user roles and permissions</p>
              </div>
              
              {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                <button
                  onClick={() => router.push('/roles/create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <span className="mr-2">+</span>
                  <span className="hidden sm:inline">Add Role</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        {role.name}
                        {role.isSystem && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            SYSTEM
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      role.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{role.userCount}</div>
                      <div className="text-sm text-gray-600">Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{role.permissions.length}</div>
                      <div className="text-sm text-gray-600">Permissions</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {role.permissions.slice(0, 4).map((permission) => (
                      <span
                        key={permission.id}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                      >
                        {permission.resource}:{permission.action}
                      </span>
                    ))}
                    {role.permissions.length > 4 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded border border-gray-200">
                        +{role.permissions.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleRole(role.id, role.isActive)}
                      className={`flex-1 px-3 py-2 rounded text-sm font-medium border ${
                        role.isActive 
                          ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                          : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      }`}
                    >
                      {role.isActive ? 'Disable' : 'Enable'}
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => handleEditRole(role)}
                        className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm hover:bg-blue-100 font-medium"
                      >
                        Edit
                      </button>
                    )}
                    {!role.isSystem && role.userCount === 0 && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded text-sm hover:bg-red-100 font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </LayoutWithVerticalNav>
    </AuthGuard>
  )
}

