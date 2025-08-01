import { getAuthToken } from './auth'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add auth user data to headers if available
    const user = getAuthToken()
    if (user) {
      headers['x-auth-user'] = JSON.stringify(user)
    }

    return headers
  }

  async get(endpoint: string): Promise<unknown> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async post(endpoint: string, data: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async put(endpoint: string, data: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async delete(endpoint: string): Promise<unknown> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()

// Product API functions
export const productApi = {
  getAll: (params?: {
    search?: string
    category?: string
    isActive?: boolean
    productType?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.category) searchParams.set('category', params.category)
    if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString())
    if (params?.productType) searchParams.set('productType', params.productType)
    
    const query = searchParams.toString()
    return apiClient.get(`/api/products${query ? `?${query}` : ''}`)
  },

  getById: (id: string) => apiClient.get(`/api/products/${id}`),

  create: (data: any) => apiClient.post('/api/products', data),

  update: (id: string, data: any) => apiClient.put(`/api/products/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/products/${id}`),

  calculate: (id: string, configuration: any, quantity?: number) => 
    apiClient.post(`/api/products/${id}/calculate`, { configuration, quantity }),

  getCategories: async () => {
    const response = await apiClient.get('/api/products?category=true') as any
    return response.data?.map((p: any) => p.category).filter(Boolean).filter((v: any, i: any, a: any) => a.indexOf(v) === i)
  }
}

export default apiClient