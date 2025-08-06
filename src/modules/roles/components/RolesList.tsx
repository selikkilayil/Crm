'use client'

import { Role } from '../types'
import RoleCard from './RoleCard'

interface RolesListProps {
  roles: Role[]
  onEdit: (role: Role) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
}

export default function RolesList({ roles, onEdit, onDelete, onToggleStatus }: RolesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  )
}