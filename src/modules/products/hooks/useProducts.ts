import { useState, useEffect } from 'react'
import { Product } from '../types'
import { productsService } from '../services'

export function useProducts(filters?: { isActive?: boolean }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productsService.getAll(filters)
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setError('Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const refreshProducts = () => {
    fetchProducts()
  }

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev])
  }

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    )
  }

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId))
  }

  return {
    products,
    loading,
    error,
    refreshProducts,
    addProduct,
    updateProduct,
    removeProduct
  }
}