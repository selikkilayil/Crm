import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from './services/ProductService'
import { validateProduct, validateProductUpdate, validateProductFilters } from './validation'
import { requireAuth, hasPermission } from '@/lib/auth-server'

const productService = new ProductService()

export class ProductHandlers {
  static async getProducts(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      if (!hasPermission(user, 'products_view')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const { searchParams } = new URL(request.url)
      const filters = {
        search: searchParams.get('search'),
        category: searchParams.get('category'),
        isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
        productType: searchParams.get('productType'),
      }

      // Validate filters
      const validationResult = validateProductFilters(filters)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Invalid filters', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const products = await productService.getProducts(validationResult.data)
      return NextResponse.json({ data: products })
    } catch (error: any) {
      console.error('Get products error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
  }

  static async createProduct(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      if (!hasPermission(user, 'products_create')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const body = await request.json()
      
      // Validate request data
      const validationResult = validateProduct(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const product = await productService.createProduct(validationResult.data)
      return NextResponse.json({ data: product, message: 'Product created successfully' }, { status: 201 })
    } catch (error: any) {
      console.error('Product creation error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message === 'SKU already exists') {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
  }

  static async getProductById(id: string, request?: NextRequest): Promise<NextResponse> {
    try {
      if (request) {
        const user = await requireAuth(request)
        
        if (!hasPermission(user, 'products_view')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      const product = await productService.getProductById(id)
      
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json({ data: product })
    } catch (error: any) {
      console.error('Get product error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
    }
  }

  static async updateProduct(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      if (!hasPermission(user, 'products_edit')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const body = await request.json()
      
      // Validate request data
      const validationResult = validateProductUpdate(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const product = await productService.updateProduct(id, validationResult.data)
      return NextResponse.json({ data: product, message: 'Product updated successfully' })
    } catch (error: any) {
      console.error('Product update error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      if (error.message?.includes('already in use')) {
        return NextResponse.json({ error: 'SKU already in use' }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }
  }

  static async deleteProduct(id: string, request?: NextRequest): Promise<NextResponse> {
    try {
      if (request) {
        const user = await requireAuth(request)
        
        if (!hasPermission(user, 'products_delete')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      await productService.deleteProduct(id)
      return NextResponse.json({ message: 'Product deleted successfully' })
    } catch (error: any) {
      console.error('Product deletion error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }
  }

  static async calculateProductPrice(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      if (!hasPermission(user, 'products_view')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const body = await request.json()
      const { configuration, quantity } = body

      const calculation = await productService.calculateProductPrice(id, configuration, quantity)
      return NextResponse.json({ data: calculation })
    } catch (error: any) {
      console.error('Product calculation error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to calculate price' }, { status: 500 })
    }
  }
}