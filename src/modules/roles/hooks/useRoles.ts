import { useState, useEffect } from 'react'
import { useAuth } from '@/shared/hooks'
import { rolesService } from '../services'
import { Role, RoleFormData } from '../types'

export function useRoles() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRoles = async () => {
    if (!user) return
    
    setLoading(true)
    const data = await rolesService.getAll()
    setRoles(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRoles()
  }, [user])

  const createRole = async (data: RoleFormData) => {
    const newRole = await rolesService.create(data)
    setRoles(prev => [...prev, newRole])
    return newRole
  }

  const updateRole = async (id: string, data: Partial<RoleFormData>) => {
    const updatedRole = await rolesService.update(id, data)
    setRoles(prev => prev.map(role => role.id === id ? updatedRole : role))
    return updatedRole
  }

  const deleteRole = async (id: string) => {
    await rolesService.delete(id)
    setRoles(prev => prev.filter(role => role.id !== id))
  }

  const toggleRoleStatus = async (id: string, isActive: boolean) => {
    const updatedRole = await rolesService.toggleStatus(id, isActive)
    setRoles(prev => prev.map(role => role.id === id ? updatedRole : role))
    return updatedRole
  }

  return {
    roles,
    loading,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus,
    refetch: fetchRoles
  }
}