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

    return headers
  }

  private getRequestInit(method: string, body?: any): RequestInit {
    return {
      method,
      headers: this.getHeaders(),
      credentials: 'include', // Always include cookies for authentication
      ...(body && { body: JSON.stringify(body) })
    }
  }

  private async handleResponse(response: Response): Promise<unknown> {
    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        } catch (jsonError) {
          // If JSON parsing fails, fall back to status text
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } else {
        // Non-JSON error response
        const textResponse = await response.text()
        console.error('Non-JSON error response:', textResponse)
        throw new Error(`Server error: ${response.status}`)
      }
    }

    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text()
      console.error('Non-JSON success response:', textResponse)
      throw new Error('Invalid response format from server')
    }

    return response.json()
  }

  async get(endpoint: string): Promise<unknown> {
    const response = await fetch(`${this.baseURL}${endpoint}`, this.getRequestInit('GET'))
    return this.handleResponse(response)
  }

  async post(endpoint: string, data: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseURL}${endpoint}`, this.getRequestInit('POST', data))
    return this.handleResponse(response)
  }

  async put(endpoint: string, data: unknown): Promise<unknown> {
    const response = await fetch(`${this.baseURL}${endpoint}`, this.getRequestInit('PUT', data))
    return this.handleResponse(response)
  }

  async delete(endpoint: string): Promise<unknown> {
    const response = await fetch(`${this.baseURL}${endpoint}`, this.getRequestInit('DELETE'))
    return this.handleResponse(response)
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