'use client'

import { useAuth } from '@/shared/hooks'
import { useRouter } from 'next/navigation'
import { useConfirm } from '@/lib/confirmation-context'
import { AuthGuard } from '@/shared/components'
import { NavBar } from '@/shared/components'
import { RolesList, useRoles, Role } from '@/modules/roles'

export default function RolesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const confirm = useConfirm()
  const { roles, loading, deleteRole, toggleRoleStatus } = useRoles()

  const handleDeleteRole = async (roleId: string) => {
    const result = await confirm({
      title: 'Delete Role',
      message: 'Are you sure you want to delete this role? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete'
    })
    
    if (result) {
      try {
        await deleteRole(roleId)
      } catch (error) {
        console.error('Error deleting role:', error)
        alert('Failed to delete role')
      }
    }
  }

  const handleEditRole = (role: Role) => {
    router.push(`/roles/edit/${role.id}`)
  }

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    try {
      await toggleRoleStatus(roleId, isActive)
    } catch (error) {
      console.error('Error toggling role:', error)
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="roles" />
        
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
          <RolesList
            roles={roles}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onToggleStatus={handleToggleRole}
          />

        </div>

      </div>
    </AuthGuard>
  )
}

