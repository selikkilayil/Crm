'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard, PermissionGuard, NavBar } from '@/shared/components'
import { PERMISSIONS } from '@/lib/permissions'
import { useConfirm } from '@/lib/confirmation-context'
import { 
  ProductsList, 
  useProducts, 
  productsService,
  Product 
} from '@/modules/products'


export default function ProductsPage() {
  const { products, loading, error, refreshProducts } = useProducts({ isActive: true })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const router = useRouter()
  const confirm = useConfirm()

  useEffect(() => {
    fetchCategories()
  }, [])


  const fetchCategories = async () => {
    try {
      const cats = await productsService.getAll()
      const uniqueCategories = [...new Set(cats.map(p => p.category).filter(Boolean))]
      setCategories(uniqueCategories as string[])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleEdit = (product: Product) => {
    router.push(`/products/edit/${product.id}`)
  }

  const handleDelete = async (productId: string) => {
    const result = await confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete'
    })
    
    if (!result) return

    try {
      await productsService.delete(productId)
      refreshProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }


  const filteredProducts = products.filter(product => {
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !product.sku?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (selectedCategory && product.category !== selectedCategory) return false
    if (selectedType && product.productType !== selectedType) return false
    if (!showInactive && !product.isActive) return false
    return true
  })

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <NavBar />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <PermissionGuard permission={PERMISSIONS.PRODUCTS_VIEW}>
        <div className="min-h-screen bg-gray-50">
          <NavBar />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                <p className="text-gray-600 mt-2">Manage your product catalog</p>
              </div>
              
              <PermissionGuard permission={PERMISSIONS.PRODUCTS_CREATE}>
                <button
                  onClick={() => router.push('/products/create')}
                  className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Product
                </button>
              </PermissionGuard>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="SIMPLE">Simple</option>
                  <option value="CONFIGURABLE">Configurable</option>
                  <option value="CALCULATED">Calculated</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">Show Inactive</span>
                  </label>
                  
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1 text-sm ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      Table
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Products Display */}
            <ProductsList
              products={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No products found</div>
                <p className="text-gray-500 mt-2">
                  {searchTerm || selectedCategory || selectedType
                    ? 'Try adjusting your filters'
                    : 'Create your first product to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </PermissionGuard>
    </AuthGuard>
  )
}