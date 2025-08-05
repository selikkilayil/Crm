import { apiClient } from '@/shared/services'
import { Customer, CustomerFormData } from '../types'

export class CustomersService {
  async getAll(): Promise<Customer[]> {
    const data = await apiClient.get('/api/customers')
    
    if (Array.isArray(data)) {
      return data.filter((customer: Customer) => !customer.isArchived)
    } else {
      console.error('API Error:', data)
      return []
    }
  }

  async getById(id: string): Promise<Customer | null> {
    try {
      const data = await apiClient.get(`/api/customers/${id}`)
      return data
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      return null
    }
  }

  async create(customerData: CustomerFormData): Promise<Customer> {
    return await apiClient.post('/api/customers', customerData)
  }

  async update(id: string, customerData: Partial<CustomerFormData>): Promise<Customer> {
    return await apiClient.put(`/api/customers/${id}`, customerData)
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/customers/${id}`)
  }

  async addTag(customerId: string, tagId: string): Promise<void> {
    await apiClient.post(`/api/customers/${customerId}/tags`, { tagId })
  }

  async removeTag(customerId: string, tagId: string): Promise<void> {
    await apiClient.delete(`/api/customers/${customerId}/tags/${tagId}`)
  }
}

export const customersService = new CustomersService()