'use client'

import { Role } from '../types'

interface RoleCardProps {
  role: Role
  onEdit: (role: Role) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
}

export default function RoleCard({ role, onEdit, onDelete, onToggleStatus }: RoleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow border hover:shadow-md transition-shadow">
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
            onClick={() => onToggleStatus(role.id, role.isActive)}
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
              onClick={() => onEdit(role)}
              className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm hover:bg-blue-100 font-medium"
            >
              Edit
            </button>
          )}
          {!role.isSystem && role.userCount === 0 && (
            <button
              onClick={() => onDelete(role.id)}
              className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded text-sm hover:bg-red-100 font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}