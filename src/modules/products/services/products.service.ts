import { productApi } from '@/shared/services'
import { Product, ProductFormData } from '../types'

export class ProductsService {
  async getAll(filters?: { isActive?: boolean }): Promise<Product[]> {
    const response = await productApi.getAll(filters)
    return response.data || []
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const data = await productApi.getById(id)
      return data
    } catch (error) {
      console.error('Failed to fetch product:', error)
      return null
    }
  }

  async create(productData: ProductFormData): Promise<Product> {
    return await productApi.create(productData)
  }

  async update(id: string, productData: Partial<ProductFormData>): Promise<Product> {
    return await productApi.update(id, productData)
  }

  async delete(id: string): Promise<void> {
    await productApi.delete(id)
  }

  async calculate(id: string, configuration: any): Promise<any> {
    return await productApi.calculate(id, configuration)
  }
}

export const productsService = new ProductsService()