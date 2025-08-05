'use client'

import { useState, useEffect } from 'react'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/components/forms'
import * as Yup from 'yup'
import { useAuth } from '@/hooks/useAuth'
import apiClient from '@/lib/api-client'

interface User {
  id: string
  name: string
  email: string
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES'
  customRoleId?: string | null
  customRole?: {
    id: string
    name: string
    description?: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string | null
  _count?: {
    assignedLeads: number
    assignedTasks: number
  }
}

const roleColors = {
  SUPERADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
  SALES: 'bg-green-100 text-green-800 border-green-200'
}

const roleIcons = {
  SUPERADMIN: '⚡',
  ADMIN: '👑',
  MANAGER: '🎯', 
  SALES: '💼'
}

interface CustomRole {
  id: string
  name: string
  description?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
    fetchCustomRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get('/api/users')
      
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        console.error('API Error:', data)
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomRoles = async () => {
    try {
      const data = await apiClient.get('/api/roles')
      
      if (Array.isArray(data)) {
        setCustomRoles(data)
      } else {
        console.error('Failed to fetch custom roles:', data)
        setCustomRoles([])
      }
    } catch (error) {
      console.error('Failed to fetch custom roles:', error)
      setCustomRoles([])
    }
  }

  const createUser = async (userData: Partial<User>) => {
    try {
      await apiClient.post('/api/users', userData)
      fetchUsers()
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const updateUser = async (userId: string, userData: Partial<User>) => {
    try {
      await apiClient.put(`/api/users/${userId}`, userData)
      fetchUsers()
      setSelectedUser(null)
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    if (userId === currentUser?.id) {
      alert('You cannot deactivate your own account')
      return
    }
    
    await updateUser(userId, { isActive })
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && user.isActive) ||
      (statusFilter === 'INACTIVE' && !user.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="users" />

        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage team members and their permissions</p>
              </div>
              
              {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <span className="mr-2">+</span>
                  <span className="hidden sm:inline">Add User</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Roles</option>
                {currentUser?.role === 'SUPERADMIN' && <option value="SUPERADMIN">Super Admin</option>}
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="SALES">Sales</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                currentUser={currentUser}
                onEdit={() => setSelectedUser(user)}
                onToggleStatus={toggleUserStatus}
              />
            ))}
          </div>

          {/* No Results */}
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first team member'}
              </p>
              {!searchTerm && roleFilter === 'ALL' && statusFilter === 'ALL' && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Add First User
                </button>
              )}
            </div>
          )}
        </main>

        {/* Modals */}
        {showAddForm && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') && (
          <CreateUserModal 
            currentUser={currentUser}
            customRoles={customRoles}
            onSubmit={createUser} 
            onClose={() => setShowAddForm(false)} 
          />
        )}

        {selectedUser && (
          <EditUserModal
            user={selectedUser}
            currentUser={currentUser}
            customRoles={customRoles}
            onSubmit={(data) => updateUser(selectedUser.id, data)}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
    </AuthGuard>
  )
}

function UserCard({ user, currentUser, onEdit, onToggleStatus }: {
  user: User
  currentUser: any
  onEdit: () => void
  onToggleStatus: (id: string, isActive: boolean) => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const isCurrentUser = user.id === currentUser?.id

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-shadow hover:shadow-md ${
      !user.isActive ? 'border-gray-300 opacity-75' : 'border-gray-200'
    }`}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg ${
              user.isActive ? 'bg-blue-500' : 'bg-gray-400'
            }`}>
              {roleIcons[user.role]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {user.name}
                {isCurrentUser && <span className="text-sm text-gray-500 ml-1">(You)</span>}
              </h3>
              <div className="flex flex-col gap-1">
                {user.customRole ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border bg-blue-100 text-blue-800 border-blue-200">
                    {user.customRole.name}
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') && (
            <div className="relative ml-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-gray-600 p-2 -m-2"
              >
                ⋮
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                  <button
                    onClick={() => { onEdit(); setShowMenu(false) }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  {!isCurrentUser && (
                    <button
                      onClick={() => { 
                        onToggleStatus(user.id, !user.isActive)
                        setShowMenu(false)
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        user.isActive ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📧</span>
            <span className="truncate">{user.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📊</span>
            <span>
              {user._count?.assignedLeads || 0} leads • {user._count?.assignedTasks || 0} tasks
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">🔄</span>
            <span>
              {user.lastLoginAt 
                ? `Last login ${new Date(user.lastLoginAt).toLocaleDateString()}`
                : 'Never logged in'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Added {new Date(user.createdAt).toLocaleDateString()}</span>
            <div className={`px-2 py-1 rounded-full text-xs ${
              user.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateUserModal({ currentUser, customRoles, onSubmit, onClose }: { 
  currentUser: any
  customRoles: CustomRole[]
  onSubmit: (data: Partial<User>) => void
  onClose: () => void 
}) {
  const [error, setError] = useState('')
  const [useCustomRole, setUseCustomRole] = useState(false)

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    role: Yup.string().required('Role is required'),
    customRoleId: Yup.string().when('useCustomRole', {
      is: true,
      then: (schema) => schema.required('Please select a custom role'),
      otherwise: (schema) => schema.nullable()
    }),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords do not match')
      .required('Please confirm your password'),
  })

  const initialValues = {
    name: '',
    email: '',
    role: 'SALES' as User['role'],
    customRoleId: '',
    password: '',
    confirmPassword: '',
  }

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      setError('')
      const submitData = {
        name: values.name,
        email: values.email,
        role: useCustomRole ? 'SALES' : values.role,
        customRoleId: useCustomRole ? values.customRoleId : null,
        password: values.password,
      }
      await onSubmit(submitData)
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Add New User</h2>
          
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
                        <label htmlFor="systemRole" className="block text-sm font-medium text-gray-700 mb-2">
                          System Role
                        </label>
                        <FormField name="role" as="select" disabled={useCustomRole}>
                          <option value="SALES">Sales - Limited access to assigned data</option>
                          <option value="MANAGER">Manager - Team management capabilities</option>
                          <option value="ADMIN">Admin - Full system access</option>
                          {currentUser?.role === 'SUPERADMIN' && (
                            <option value="SUPERADMIN">Super Admin - Complete system control</option>
                          )}
                        </FormField>
                      </div>
                    </div>

                    {/* Custom Role Option */}
                    {customRoles.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          id="customRole"
                          name="roleType"
                          checked={useCustomRole}
                          onChange={() => setUseCustomRole(true)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="flex-1">
                          <label htmlFor="customRole" className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Role
                          </label>
                          <FormField name="customRoleId" as="select" disabled={!useCustomRole}>
                            <option value="">Select a custom role</option>
                            {customRoles.map(role => (
                              <option key={role.id} value={role.id}>
                                {role.name} {role.description && `- ${role.description}`}
                              </option>
                            ))}
                          </FormField>
                          <p className="text-xs text-gray-500 mt-1">
                            Custom roles have specific permissions defined in the Roles section
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <FormField name="password" label="Password" type="password" required placeholder="Minimum 6 characters" />
                <FormField name="confirmPassword" label="Confirm Password" type="password" required placeholder="Confirm password" />
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <FormButton type="button" variant="secondary" onClick={onClose}>
                    Cancel
                  </FormButton>
                  <FormButton type="submit" variant="primary" loading={isSubmitting}>
                    Create User
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

function EditUserModal({ user, currentUser, customRoles, onSubmit, onClose }: { 
  user: User
  currentUser: any
  customRoles: CustomRole[]
  onSubmit: (data: Partial<User>) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    customRoleId: user.customRoleId || '',
    useCustomRole: !!user.customRoleId,
    isActive: user.isActive,
  })
  const isCurrentUser = user.id === currentUser?.id

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      email: formData.email,
      role: formData.useCustomRole ? 'SALES' : formData.role, // Default to SALES if using custom role
      customRoleId: formData.useCustomRole ? formData.customRoleId : null,
      isActive: formData.isActive,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Edit User</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Role Type *</label>
              
              <div className="space-y-4">
                {/* System Role Option */}
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="editSystemRole"
                    name="editRoleType"
                    checked={!formData.useCustomRole}
                    onChange={() => setFormData({ ...formData, useCustomRole: false })}
                    disabled={isCurrentUser}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <label htmlFor="editSystemRole" className="block text-sm font-medium text-gray-700 mb-2">
                      System Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                      disabled={formData.useCustomRole || isCurrentUser}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="SALES">Sales - Limited access to assigned data</option>
                      <option value="MANAGER">Manager - Team management capabilities</option>
                      <option value="ADMIN">Admin - Full system access</option>
                      {currentUser?.role === 'SUPERADMIN' && (
                        <option value="SUPERADMIN">Super Admin - Complete system control</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Custom Role Option */}
                {customRoles.length > 0 && (
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      id="editCustomRole"
                      name="editRoleType"
                      checked={formData.useCustomRole}
                      onChange={() => setFormData({ ...formData, useCustomRole: true })}
                      disabled={isCurrentUser}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <label htmlFor="editCustomRole" className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Role
                      </label>
                      <select
                        value={formData.customRoleId}
                        onChange={(e) => setFormData({ ...formData, customRoleId: e.target.value })}
                        disabled={!formData.useCustomRole || isCurrentUser}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select a custom role</option>
                        {customRoles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name} {role.description && `- ${role.description}`}
                          </option>
                        ))}
                      </select>
                      {user.customRole && (
                        <p className="text-xs text-gray-600 mt-1">
                          Current: {user.customRole.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {isCurrentUser && (
                <p className="text-xs text-gray-500 mt-2">You cannot change your own role</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                disabled={isCurrentUser} // Can't deactivate self
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Active user account
              </label>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">User Statistics</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Assigned Leads: {user._count?.assignedLeads || 0}</div>
                <div>Assigned Tasks: {user._count?.assignedTasks || 0}</div>
                <div>Member Since: {new Date(user.createdAt).toLocaleDateString()}</div>
                <div>
                  Last Login: {user.lastLoginAt 
                    ? new Date(user.lastLoginAt).toLocaleDateString() 
                    : 'Never'}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}