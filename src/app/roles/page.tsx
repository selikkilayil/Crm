'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'

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
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  useEffect(() => {
    if (user) {
      fetchRoles()
    }
  }, [user])

  const fetchRoles = async () => {
    try {
      const headers: Record<string, string> = {}
      if (user) {
        headers['x-auth-user'] = JSON.stringify(user)
      }
      
      const response = await fetch('/api/roles', { headers })
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (user) {
        headers['x-auth-user'] = JSON.stringify(user)
      }
      
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
        headers
      })

      if (response.ok) {
        fetchRoles()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete role')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      alert('Failed to delete role')
    }
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setShowEditModal(true)
  }

  const handleUpdateRole = async (roleData: any) => {
    if (!editingRole) return

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (user) {
        headers['x-auth-user'] = JSON.stringify(user)
      }

      const response = await fetch(`/api/roles/${editingRole.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(roleData),
      })

      if (response.ok) {
        fetchRoles()
        setShowEditModal(false)
        setEditingRole(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (user) {
        headers['x-auth-user'] = JSON.stringify(user)
      }
      
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchRoles()
      }
    } catch (error) {
      console.error('Error toggling role:', error)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <NavBar currentPage="users" />
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="users" />
        
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                <p className="text-gray-600">Manage user roles and permissions</p>
              </div>
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

        {/* Edit Role Modal */}
        {showEditModal && editingRole && (
          <EditRoleModal
            role={editingRole}
            onSave={handleUpdateRole}
            onClose={() => {
              setShowEditModal(false)
              setEditingRole(null)
            }}
          />
        )}
      </div>
    </AuthGuard>
  )
}

// Edit Role Modal Component
function EditRoleModal({ role, onSave, onClose }: {
  role: Role
  onSave: (data: any) => void
  onClose: () => void
}) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description || '',
  })
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({})
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role.permissions.map(p => p.id)
  )
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const headers: Record<string, string> = {}
      if (user) {
        headers['x-auth-user'] = JSON.stringify(user)
      }
      
      const response = await fetch('/api/permissions', { headers })
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
        setGroupedPermissions(data.groupedPermissions)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
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
    setSubmitting(true)

    const roleData = {
      ...formData,
      permissionIds: selectedPermissions,
    }

    onSave(roleData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-xl">
        <div className="modal-header">
          <h2 className="modal-title">Edit Role</h2>
          <button onClick={onClose} className="modal-close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label form-label-required">Role Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="form-input"
                placeholder="Enter role name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input"
                placeholder="Enter role description"
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="loading-spinner loading-spinner-md"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-gray-900 capitalize">
                        {category}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {categoryPermissions.every(p => selectedPermissions.includes(p.id))
                          ? 'Deselect All'
                          : 'Select All'
                        }
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="form-checkbox"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {permission.action}
                            </span>
                            {permission.description && (
                              <p className="text-xs text-gray-500">{permission.description}</p>
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

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="btn btn-primary"
            >
              {submitting ? (
                <>
                  <div className="loading-spinner loading-spinner-sm mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}