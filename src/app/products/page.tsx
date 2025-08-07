'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import PermissionGuard from '@/components/PermissionGuard'
import NavBar from '@/components/NavBar'
import { productApi } from '@/lib/api-client'
import { PERMISSIONS } from '@/lib/permissions'
import { useConfirm } from '@/lib/confirmation-context'

interface Product {
  id: string
  name: string
  description: string | null
  sku: string | null
  category: string | null
  productType: 'SIMPLE' | 'CONFIGURABLE' | 'CALCULATED'
  pricingType: 'FIXED' | 'PER_UNIT' | 'CALCULATED' | 'VARIANT_BASED'
  basePrice: number
  costPrice: number | null
  calculationFormula: string | null
  trackInventory: boolean
  currentStock: number | null
  minStockLevel: number | null
  unit: string
  defaultTaxRate: number
  isActive: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  attributes: ProductAttribute[]
  variants: ProductVariant[]
  _count: {
    quotationItems: number
  }
}

interface ProductAttribute {
  id: string
  name: string
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'DIMENSION' | 'BOOLEAN'
  isRequired: boolean
  isConfigurable: boolean
  options: AttributeOption[]
}

interface AttributeOption {
  id: string
  value: string
  displayName: string | null
  priceModifier: number
  isActive: boolean
}

interface ProductVariant {
  id: string
  sku: string | null
  name: string | null
  configuration: any
  price: number | null
  stock: number | null
  isActive: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    fetchProducts()
    fetchCategories()
  }, [searchTerm, selectedCategory, selectedType, showInactive])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productApi.getAll({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        productType: selectedType || undefined,
        isActive: showInactive ? undefined : true
      }) as any
      setProducts(response.data || [])
    } catch (err) {
      setError('Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const cats = await productApi.getCategories()
      setCategories(cats || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleDelete = async (id: string) => {
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
      await productApi.delete(id)
      await fetchProducts()
    } catch (err) {
      alert('Failed to delete product')
      console.error('Error deleting product:', err)
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
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDelete={handleDelete}
                    onEdit={(id) => router.push(`/products/edit/${id}`)}
                    onView={(id) => router.push(`/products/${id}`)}
                  />
                ))}
              </div>
            ) : (
              <ProductTable
                products={filteredProducts}
                onDelete={handleDelete}
                onEdit={(id) => router.push(`/products/edit/${id}`)}
                onView={(id) => router.push(`/products/${id}`)}
              />
            )}

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

function ProductCard({ product, onDelete, onEdit, onView }: {
  product: Product
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
}) {
  const getPriceDisplay = () => {
    if (product.pricingType === 'CALCULATED') {
      return `₹${product.basePrice}/${product.unit} (calculated)`
    }
    if (product.pricingType === 'VARIANT_BASED') {
      return 'Variable pricing'
    }
    return `₹${product.basePrice}${product.pricingType === 'PER_UNIT' ? `/${product.unit}` : ''}`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SIMPLE': return 'bg-green-100 text-green-800'
      case 'CONFIGURABLE': return 'bg-blue-100 text-blue-800'
      case 'CALCULATED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
            {product.sku && (
              <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
            )}
            {product.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
            )}
          </div>
          {!product.isActive && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Inactive
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Price:</span>
            <span className="text-sm font-medium">{getPriceDisplay()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Type:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(product.productType)}`}>
              {product.productType}
            </span>
          </div>
          
          {product.category && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Category:</span>
              <span className="text-sm">{product.category}</span>
            </div>
          )}
          
          {product.trackInventory && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Stock:</span>
              <span className="text-sm">{product.currentStock} {product.unit}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Used in:</span>
            <span className="text-sm">{product._count.quotationItems} quotations</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onView(product.id)}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            View
          </button>
          
          <PermissionGuard permission={PERMISSIONS.PRODUCTS_EDIT}>
            <button
              onClick={() => onEdit(product.id)}
              className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Edit
            </button>
          </PermissionGuard>
          
          <PermissionGuard permission={PERMISSIONS.PRODUCTS_DELETE}>
            <button
              onClick={() => onDelete(product.id)}
              className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              disabled={product._count.quotationItems > 0}
              title={product._count.quotationItems > 0 ? 'Cannot delete product used in quotations' : 'Delete product'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  )
}

function ProductTable({ products, onDelete, onEdit, onView }: {
  products: Product[]
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onView: (id: string) => void
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    {product.sku && (
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.category || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.productType === 'SIMPLE' ? 'bg-green-100 text-green-800' :
                    product.productType === 'CONFIGURABLE' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {product.productType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{product.basePrice}{product.pricingType === 'PER_UNIT' ? `/${product.unit}` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.trackInventory ? `${product.currentStock} ${product.unit}` : 'Not tracked'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => onView(product.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    View
                  </button>
                  
                  <PermissionGuard permission={PERMISSIONS.PRODUCTS_EDIT}>
                    <button
                      onClick={() => onEdit(product.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </PermissionGuard>
                  
                  <PermissionGuard permission={PERMISSIONS.PRODUCTS_DELETE}>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={product._count.quotationItems > 0}
                    >
                      Delete
                    </button>
                  </PermissionGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}