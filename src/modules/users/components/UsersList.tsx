'use client'

import { useState } from 'react'
import { User, roleColors, roleIcons } from '../types'

interface UsersListProps {
  users: User[]
  currentUser: any
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
  onToggleStatus: (userId: string, isActive: boolean) => void
}

export default function UsersList({
  users,
  currentUser,
  onEdit,
  onDelete,
  onToggleStatus
}: UsersListProps) {
  const [showMenu, setShowMenu] = useState<string | null>(null)

  const getRoleDisplay = (user: User) => {
    if (user.customRole) {
      return {
        name: user.customRole.name,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '🎭'
      }
    }
    return {
      name: user.role,
      color: roleColors[user.role],
      icon: roleIcons[user.role]
    }
  }

  const formatLastLogin = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return 'Never'
    return new Date(lastLoginAt).toLocaleDateString()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => {
        const roleDisplay = getRoleDisplay(user)
        
        return (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                    user.isActive ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  {/* Menu button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === user.id ? null : user.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      ⋮
                    </button>
                    
                    {showMenu === user.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                        <button
                          onClick={() => {
                            onEdit(user)
                            setShowMenu(null)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onToggleStatus(user.id, !user.isActive)
                            setShowMenu(null)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {currentUser?.role === 'SUPERADMIN' && user.id !== currentUser.id && (
                          <button
                            onClick={() => {
                              onDelete(user.id)
                              setShowMenu(null)
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="mb-4">
                <span className={`px-3 py-1 text-sm rounded-full border ${roleDisplay.color}`}>
                  {roleDisplay.icon} {roleDisplay.name}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4 text-sm">
                {user._count && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Leads assigned:</span>
                      <span className="font-medium">{user._count.assignedLeads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tasks assigned:</span>
                      <span className="font-medium">{user._count.assignedTasks}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Last login:</span>
                  <span className="font-medium">{formatLastLogin(user.lastLoginAt)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}