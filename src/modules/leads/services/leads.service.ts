import { apiClient } from '@/shared/services'
import type { Lead, LeadFilters, LeadFormData } from '../types'

export class LeadsService {
  private readonly basePath = '/api/leads'

  async getAll(filters?: LeadFilters): Promise<Lead[]> {
    const params = new URLSearchParams()
    
    if (filters?.status) params.set('status', filters.status)
    if (filters?.assignedToId) params.set('assignedToId', filters.assignedToId)
    if (filters?.source) params.set('source', filters.source)
    if (filters?.search) params.set('search', filters.search)
    
    const query = params.toString()
    const response = await apiClient.get(`${this.basePath}${query ? `?${query}` : ''}`)
    
    return Array.isArray(response) ? response as Lead[] : []
  }

  async getById(id: string): Promise<Lead> {
    const response = await apiClient.get(`${this.basePath}/${id}`)
    return response as Lead
  }

  async create(data: LeadFormData): Promise<Lead> {
    const response = await apiClient.post(this.basePath, {
      ...data,
      value: data.value ? parseFloat(data.value) : null,
      assignedToId: data.assignedToId || null
    })
    return response as Lead
  }

  async update(id: string, data: Partial<LeadFormData>): Promise<Lead> {
    const updateData = {
      ...data,
      value: data.value ? parseFloat(data.value) : null,
      assignedToId: data.assignedToId || null
    }
    const response = await apiClient.put(`${this.basePath}/${id}`, updateData)
    return response as Lead
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  async convertToCustomer(id: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/convert`, {})
  }

  async updateStatus(id: string, status: Lead['status']): Promise<Lead> {
    const response = await apiClient.put(`${this.basePath}/${id}`, { status })
    return response as Lead
  }
}

export const leadsService = new LeadsService()