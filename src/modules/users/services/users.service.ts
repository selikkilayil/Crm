import { apiClient } from '@/shared/services'
import { User, UserFormData, CustomRole } from '../types'

export class UsersService {
  async getAll(): Promise<User[]> {
    try {
      const data = await apiClient.get('/api/users')
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Failed to fetch users:', error)
      return []
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      const data = await apiClient.get(`/api/users/${id}`)
      return data
    } catch (error) {
      console.error('Failed to fetch user:', error)
      return null
    }
  }

  async create(userData: UserFormData): Promise<User> {
    return await apiClient.post('/api/users', userData)
  }

  async update(id: string, userData: Partial<UserFormData>): Promise<User> {
    return await apiClient.put(`/api/users/${id}`, userData)
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/users/${id}`)
  }

  async updatePassword(id: string, passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiClient.put(`/api/users/${id}/password`, passwordData)
  }

  async getCustomRoles(): Promise<CustomRole[]> {
    try {
      const data = await apiClient.get('/api/roles')
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Failed to fetch custom roles:', error)
      return []
    }
  }
}

export const usersService = new UsersService()