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
}

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    productType: 'SIMPLE' as const,
    pricingType: 'FIXED' as const,
    basePrice: 0,
    costPrice: 0,
    calculationFormula: '',
    trackInventory: false,
    currentStock: 0,
    minStockLevel: 0,
    unit: 'piece',
    defaultTaxRate: 18,
    isActive: true
  })

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
      const productData = response.data
      setProduct(productData)
      
      // Populate form
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        sku: productData.sku || '',
        category: productData.category || '',
        productType: productData.productType || 'SIMPLE',
        pricingType: productData.pricingType || 'FIXED',
        basePrice: productData.basePrice || 0,
        costPrice: productData.costPrice || 0,
        calculationFormula: productData.calculationFormula || '',
        trackInventory: productData.trackInventory || false,
        currentStock: productData.currentStock || 0,
        minStockLevel: productData.minStockLevel || 0,
        unit: productData.unit || 'piece',
        defaultTaxRate: productData.defaultTaxRate || 18,
        isActive: productData.isActive !== false
      })
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolvedParams?.id) return

    try {
      setSaving(true)
      setError(null)

      const updateData = {
        ...formData,
        basePrice: Number(formData.basePrice),
        costPrice: formData.costPrice ? Number(formData.costPrice) : null,
        currentStock: formData.trackInventory ? Number(formData.currentStock) : null,
        minStockLevel: formData.trackInventory ? Number(formData.minStockLevel) : null,
        defaultTaxRate: Number(formData.defaultTaxRate)
      }

      await productApi.update(resolvedParams.id, updateData)
      router.push(`/products/${resolvedParams.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  if (error && !product) {
    return (
      <AuthGuard>
        <NavBar currentPage="products" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg">{error}</div>
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
      <PermissionGuard permission={PERMISSIONS.PRODUCTS_EDIT}>
        <NavBar currentPage="products" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-2">Update product information</p>
            </div>
            <button
              onClick={() => router.push(`/products/${resolvedParams?.id}`)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram</option>
                    <option value="meter">Meter</option>
                    <option value="sqft">Square Feet</option>
                    <option value="liter">Liter</option>
                    <option value="box">Box</option>
                    <option value="set">Set</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Product Type */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <select
                    value={formData.productType}
                    onChange={(e) => handleInputChange('productType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="SIMPLE">Simple Product</option>
                    <option value="CONFIGURABLE">Configurable Product</option>
                    <option value="CALCULATED">Calculated Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing Type
                  </label>
                  <select
                    value={formData.pricingType}
                    onChange={(e) => handleInputChange('pricingType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="FIXED">Fixed Price</option>
                    <option value="PER_UNIT">Per Unit</option>
                    <option value="CALCULATED">Calculated</option>
                    <option value="VARIANT_BASED">Variant Based</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange('basePrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange('costPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.defaultTaxRate}
                    onChange={(e) => handleInputChange('defaultTaxRate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {formData.pricingType === 'CALCULATED' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calculation Formula
                    </label>
                    <input
                      type="text"
                      value={formData.calculationFormula}
                      onChange={(e) => handleInputChange('calculationFormula', e.target.value)}
                      placeholder="e.g., length * width * basePrice"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use variables like 'length', 'width', 'height', 'basePrice' in your formula
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Management */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventory Management</h2>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.trackInventory}
                    onChange={(e) => handleInputChange('trackInventory', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Track Inventory</span>
                </label>
              </div>

              {formData.trackInventory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.currentStock}
                      onChange={(e) => handleInputChange('currentStock', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minStockLevel}
                      onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Product is Active</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Inactive products won't be available for selection in quotations
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/products/${resolvedParams?.id}`)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </PermissionGuard>
    </AuthGuard>
  )
}