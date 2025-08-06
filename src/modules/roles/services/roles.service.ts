import { apiClient } from '@/shared/services'
import { Role, RoleFormData } from '../types'

export class RolesService {
  async getAll(): Promise<Role[]> {
    try {
      const data = await apiClient.get('/api/roles')
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      return []
    }
  }

  async getById(id: string): Promise<Role | null> {
    try {
      return await apiClient.get(`/api/roles/${id}`)
    } catch (error) {
      console.error('Failed to fetch role:', error)
      return null
    }
  }

  async create(data: RoleFormData): Promise<Role> {
    return await apiClient.post('/api/roles', data)
  }

  async update(id: string, data: Partial<RoleFormData>): Promise<Role> {
    return await apiClient.put(`/api/roles/${id}`, data)
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/roles/${id}`)
  }

  async toggleStatus(id: string, isActive: boolean): Promise<Role> {
    return await apiClient.put(`/api/roles/${id}`, { isActive: !isActive })
  }
}

export const rolesService = new RolesService()