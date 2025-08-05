'use client'

import { useState } from 'react'
import { AuthGuard, NavBar } from '@/shared/components'
import { useAuth } from '@/shared/hooks'
import { 
  UserForm, 
  UsersList, 
  useUsers, 
  usersService,
  User, 
  CustomRole 
} from '@/modules/users'


export default function UsersPage() {
  const { users, customRoles, loading, refreshUsers, addUser } = useUsers()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const { user: currentUser } = useAuth()

  const handleCreateUser = async (userData: any) => {
    try {
      const newUser = await usersService.create(userData)
      addUser(newUser)
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await usersService.delete(userId)
      refreshUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    if (userId === currentUser?.id) {
      alert('You cannot deactivate your own account')
      return
    }
    
    try {
      await usersService.update(userId, { isActive })
      refreshUsers()
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
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
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <NavBar currentPage="users" />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="users" />
        
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
              <p className="text-gray-600 mt-2">
                Manage user accounts and permissions ({filteredUsers.length} users)
              </p>
            </div>
            
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <span className="mr-2">+</span>
                Add User
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SALES">Sales</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Users</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users List */}
          <UsersList
            users={filteredUsers}
            currentUser={currentUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
          />

          {/* No Results */}
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No users found</div>
              <p className="text-gray-500 mt-2">
                {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL' ? 
                  'Try adjusting your search criteria' : 
                  'Create your first user to get started'
                }
              </p>
              {filteredUsers.length === 0 && searchTerm === '' && roleFilter === 'ALL' && statusFilter === 'ALL' && (
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
          <UserForm 
            currentUser={currentUser}
            customRoles={customRoles}
            onSubmit={handleCreateUser} 
            onClose={() => setShowAddForm(false)} 
          />
        )}
      </div>
    </AuthGuard>
  )
}