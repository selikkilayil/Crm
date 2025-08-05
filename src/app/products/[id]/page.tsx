'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/shared/components'
import { PermissionGuard } from '@/shared/components'
import { NavBar } from '@/shared/components'
import { productApi } from '@/shared/services'
import { PERMISSIONS } from '@/lib/permissions'

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
  createdAt: string
  updatedAt: string
  attributes: ProductAttribute[]
  variants: ProductVariant[]
  quotationItems: QuotationItem[]
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

interface QuotationItem {
  id: string
  quantity: number
  unitPrice: number
  total: number
  quotation: {
    id: string
    quotationNumber: string
    date: string
    status: string
    customer: {
      name: string
    }
  }
}

export default function ProductViewPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchProduct()
    }
  }, [resolvedParams])

  const fetchProduct = async () => {
    if (!resolvedParams?.id) return
    
    try {
      setLoading(true)
      const response = await productApi.getById(resolvedParams.id) as any
      setProduct(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const getPriceDisplay = () => {
    if (!product) return ''
    
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

  if (loading) {
    return (
      <AuthGuard>
        <NavBar currentPage="products" />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-500">Loading product...</div>
        </div>
      </AuthGuard>
    )
  }

  if (error || !product) {
    return (
      <AuthGuard>
        <NavBar currentPage="products" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg">{error || 'Product not found'}</div>
            <button
              onClick={() => router.push('/products')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Products
            </button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <PermissionGuard permission={PERMISSIONS.PRODUCTS_VIEW}>
        <NavBar currentPage="products" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {!product.isActive && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    Inactive
                  </span>
                )}
                <span className={`px-3 py-1 text-sm rounded-full ${getTypeColor(product.productType)}`}>
                  {product.productType}
                </span>
              </div>
              {product.sku && (
                <p className="text-gray-600">SKU: {product.sku}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <PermissionGuard resource="products" action="edit" permission={PERMISSIONS.PRODUCTS_EDIT}>
                <button
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Product
                </button>
              </PermissionGuard>
              <button
                onClick={() => router.push('/products')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to Products
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU</label>
                    <p className="mt-1 text-sm text-gray-900">{product.sku || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900">{product.category || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <p className="mt-1 text-sm text-gray-900">{product.unit}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{product.description || 'No description'}</p>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pricing Type</label>
                    <p className="mt-1 text-sm text-gray-900">{product.pricingType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Base Price</label>
                    <p className="mt-1 text-sm text-gray-900">{getPriceDisplay()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {product.costPrice ? `₹${product.costPrice}` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Rate</label>
                    <p className="mt-1 text-sm text-gray-900">{product.defaultTaxRate}%</p>
                  </div>
                  {product.calculationFormula && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Calculation Formula</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                        {product.calculationFormula}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory */}
              {product.trackInventory && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.currentStock !== null ? `${product.currentStock} ${product.unit}` : 'Not tracked'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.minStockLevel !== null ? `${product.minStockLevel} ${product.unit}` : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Attributes</h2>
                  <div className="space-y-4">
                    {product.attributes.map((attribute) => (
                      <div key={attribute.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{attribute.name}</h3>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              attribute.isRequired ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {attribute.isRequired ? 'Required' : 'Optional'}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {attribute.type}
                            </span>
                          </div>
                        </div>
                        {attribute.options && attribute.options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-2">Options:</p>
                            <div className="flex flex-wrap gap-2">
                              {attribute.options.map((option) => (
                                <span
                                  key={option.id}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    option.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {option.displayName || option.value}
                                  {option.priceModifier !== 0 && (
                                    <span className="ml-1">
                                      ({option.priceModifier > 0 ? '+' : ''}₹{option.priceModifier})
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Variants</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          {product.trackInventory && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {product.variants.map((variant) => (
                          <tr key={variant.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {variant.name || 'Unnamed variant'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {variant.sku || 'No SKU'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {variant.price ? `₹${variant.price}` : 'No price'}
                            </td>
                            {product.trackInventory && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {variant.stock !== null ? `${variant.stock} ${product.unit}` : 'Not tracked'}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Usage Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {product.quotationItems?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Used in quotations</p>
                </div>
              </div>

              {/* Recent Quotations */}
              {product.quotationItems && product.quotationItems.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Quotations</h2>
                  <div className="space-y-3">
                    {product.quotationItems.slice(0, 5).map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {item.quotation.quotationNumber}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.quotation.customer.name}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.quotation.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            item.quotation.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.quotation.status}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Qty: {item.quantity} × ₹{item.unitPrice} = ₹{item.total}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Metadata */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block font-medium text-gray-700">Created</label>
                    <p className="text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700">Last Updated</label>
                    <p className="text-gray-600">
                      {new Date(product.updatedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PermissionGuard>
    </AuthGuard>
  )
}