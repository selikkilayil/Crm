'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
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
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
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

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions')
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
        setGroupedPermissions(data.groupedPermissions)
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
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

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
                <p className="text-gray-600">Create and manage user roles and permissions</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Role
              </button>
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-lg shadow-md border-2 border-gray-300 hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-black text-lg flex items-center">
                        {role.name}
                        {role.isSystem && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-black rounded border-2 border-yellow-300 font-bold">
                            SYSTEM
                          </span>
                        )}
                      </h3>
                      <p className="text-base text-black mt-1 font-medium">{role.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full border-2 ${
                      role.isActive 
                        ? 'bg-green-100 text-green-900 border-green-400' 
                        : 'bg-red-100 text-red-900 border-red-400'
                    }`}>
                      {role.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded border">
                    <div className="flex justify-between text-base">
                      <span className="text-black font-bold">Users:</span>
                      <span className="text-black font-bold">{role.userCount}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-black font-bold">Permissions:</span>
                      <span className="text-black font-bold">{role.permissions.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <span
                        key={permission.id}
                        className="px-2 py-1 bg-blue-100 text-black text-xs rounded border-2 border-blue-300 font-bold"
                      >
                        {permission.resource}:{permission.action}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-black text-xs rounded border-2 border-gray-400 font-bold">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRole(role)
                        setShowEditModal(true)
                      }}
                      className="flex-1 bg-blue-100 text-black px-3 py-2 rounded text-sm hover:bg-blue-200 border-2 border-blue-300 font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleRole(role.id, role.isActive)}
                      className={`flex-1 px-3 py-2 rounded text-sm font-bold border-2 ${
                        role.isActive 
                          ? 'bg-red-100 text-red-900 hover:bg-red-200 border-red-400' 
                          : 'bg-green-100 text-green-900 hover:bg-green-200 border-green-400'
                      }`}
                    >
                      {role.isActive ? 'Disable' : 'Enable'}
                    </button>
                    {!role.isSystem && role.userCount === 0 && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="px-3 py-2 bg-red-100 text-red-900 rounded text-sm hover:bg-red-200 border-2 border-red-400 font-bold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create Role Modal */}
          {showCreateModal && (
            <CreateRoleModal
              permissions={permissions}
              groupedPermissions={groupedPermissions}
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false)
                fetchRoles()
              }}
            />
          )}

          {/* Edit Role Modal */}
          {showEditModal && selectedRole && (
            <EditRoleModal
              role={selectedRole}
              permissions={permissions}
              groupedPermissions={groupedPermissions}
              onClose={() => {
                setShowEditModal(false)
                setSelectedRole(null)
              }}
              onSuccess={() => {
                setShowEditModal(false)
                setSelectedRole(null)
                fetchRoles()
              }}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  )
}

function CreateRoleModal({ permissions, groupedPermissions, onClose, onSuccess }: {
  permissions: Permission[]
  groupedPermissions: Record<string, Permission[]>
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (selectedPermissions.length === 0) {
      setError('Please select at least one permission')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissionIds: selectedPermissions,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create role')
      }
    } catch (error) {
      setError('Failed to create role')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Create New Role</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Permissions</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryPermissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-900 font-medium">
                          {permission.resource}:{permission.action}
                        </span>
                        {permission.description && (
                          <span className="text-gray-600 text-xs">
                            - {permission.description}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditRoleModal({ role, permissions, groupedPermissions, onClose, onSuccess }: {
  role: Role
  permissions: Permission[]
  groupedPermissions: Record<string, Permission[]>
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description || '',
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role.permissions.map(p => p.id)
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (selectedPermissions.length === 0) {
      setError('Please select at least one permission')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissionIds: selectedPermissions,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update role')
      }
    } catch (error) {
      setError('Failed to update role')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-black">Edit Role: {role.name}</h2>
          {role.isSystem && (
            <p className="text-sm text-orange-900 mt-1 font-bold bg-orange-100 p-2 rounded border">
              This is a system role. Some fields may be restricted.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Role Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={role.isSystem}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 text-black font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-black mb-4">Permissions</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <div key={category} className="border-2 border-gray-400 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-bold text-black mb-3 text-base">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryPermissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-center space-x-2 text-sm bg-white p-2 rounded border border-gray-300"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                        <span className="text-black font-bold">
                          {permission.resource}:{permission.action}
                        </span>
                        {permission.description && (
                          <span className="text-gray-700 text-xs font-medium">
                            - {permission.description}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black bg-gray-200 rounded-lg hover:bg-gray-300 border-2 border-gray-400 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 border-2 border-blue-700 font-bold"
            >
              {submitting ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}