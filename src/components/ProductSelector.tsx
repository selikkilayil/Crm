'use client'

import { useState, useEffect } from 'react'
import { productApi } from '@/lib/api-client'

interface Product {
  id: string
  name: string
  description: string | null
  sku: string | null
  category: string | null
  productType: 'SIMPLE' | 'CONFIGURABLE' | 'CALCULATED'
  pricingType: 'FIXED' | 'PER_UNIT' | 'CALCULATED' | 'VARIANT_BASED'
  basePrice: number
  unit: string
  defaultTaxRate: number
  attributes: ProductAttribute[]
  variants: ProductVariant[]
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
  isActive: boolean
}

interface ProductSelectorProps {
  selectedProductId?: string
  selectedVariantId?: string
  configuration?: any
  onProductSelect: (product: Product | null, variant?: ProductVariant, configuration?: any) => void
  onConfigurationChange?: (configuration: any) => void
}

export default function ProductSelector({
  selectedProductId,
  selectedVariantId,
  configuration = {},
  onProductSelect,
  onConfigurationChange
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId)
      setSelectedProduct(product || null)
    } else {
      setSelectedProduct(null)
    }
  }, [selectedProductId, products])

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll({ isActive: true }) as any
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    
    // Always call onProductSelect first
    onProductSelect(product, undefined, {})
    
    if (product.productType === 'SIMPLE') {
      // For simple products, close modal after selection
      setTimeout(() => setShowProductModal(false), 100)
    }
    // For configurable/calculated products, keep modal open for configuration
  }

  const handleVariantSelect = (variant: ProductVariant) => {
    if (selectedProduct) {
      onProductSelect(selectedProduct, variant, configuration)
    }
  }

  const handleConfigurationChange = (attributeId: string, value: any) => {
    const newConfiguration = { ...configuration, [attributeId]: value }
    if (onConfigurationChange) {
      onConfigurationChange(newConfiguration)
    }
  }

  const getPriceDisplay = (product: Product) => {
    if (product.pricingType === 'CALCULATED') {
      return `₹${Number(product.basePrice)}/${product.unit} (calculated)`
    }
    if (product.pricingType === 'VARIANT_BASED') {
      return 'Variable pricing'
    }
    return `₹${Number(product.basePrice)}${product.pricingType === 'PER_UNIT' ? `/${product.unit}` : ''}`
  }

  return (
    <div className="space-y-4">
      {/* Selected Product Display */}
      {selectedProduct ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">{selectedProduct.name}</h3>
              {selectedProduct.sku && (
                <p className="text-sm text-blue-700">SKU: {selectedProduct.sku}</p>
              )}
              <p className="text-sm text-blue-600">{getPriceDisplay(selectedProduct)}</p>
              {selectedProduct.description && (
                <p className="text-sm text-blue-700 mt-1">{selectedProduct.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowProductModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change
              </button>
              <button
                onClick={() => onProductSelect(null)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Variant Selection */}
          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-blue-800 mb-2">
                Select Variant
              </label>
              <select
                value={selectedVariantId || ''}
                onChange={(e) => {
                  const variant = selectedProduct.variants.find(v => v.id === e.target.value)
                  if (variant) handleVariantSelect(variant)
                }}
                className="w-full px-3 py-2 border border-blue-300 rounded bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a variant</option>
                {selectedProduct.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name || 'Unnamed variant'} 
                    {variant.sku && ` (${variant.sku})`}
                    {variant.price && ` - ₹${variant.price}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Configuration for Configurable/Calculated Products */}
          {(selectedProduct.productType === 'CONFIGURABLE' || selectedProduct.productType === 'CALCULATED') && 
           selectedProduct.attributes && selectedProduct.attributes.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Product Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProduct.attributes.filter(attr => attr.isConfigurable).map((attribute) => (
                  <div key={attribute.id}>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      {attribute.name} {attribute.isRequired && '*'}
                    </label>
                    
                    {attribute.type === 'SELECT' && (
                      <select
                        value={configuration[attribute.id] || ''}
                        onChange={(e) => handleConfigurationChange(attribute.id, e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded bg-white focus:ring-2 focus:ring-blue-500"
                        required={attribute.isRequired}
                      >
                        <option value="">Select {attribute.name}</option>
                        {attribute.options.filter(opt => opt.isActive).map((option) => (
                          <option key={option.id} value={option.value}>
                            {option.displayName || option.value}
                            {option.priceModifier !== 0 && ` (${option.priceModifier > 0 ? '+' : ''}₹${option.priceModifier})`}
                          </option>
                        ))}
                      </select>
                    )}

                    {attribute.type === 'NUMBER' && (
                      <input
                        type="number"
                        value={configuration[attribute.id] || ''}
                        onChange={(e) => handleConfigurationChange(attribute.id, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${attribute.name.toLowerCase()}`}
                        min={attribute.minValue}
                        max={attribute.maxValue}
                        required={attribute.isRequired}
                      />
                    )}

                    {attribute.type === 'TEXT' && (
                      <input
                        type="text"
                        value={configuration[attribute.id] || ''}
                        onChange={(e) => handleConfigurationChange(attribute.id, e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${attribute.name.toLowerCase()}`}
                        required={attribute.isRequired}
                      />
                    )}

                    {attribute.type === 'BOOLEAN' && (
                      <select
                        value={configuration[attribute.id] || ''}
                        onChange={(e) => handleConfigurationChange(attribute.id, e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-blue-300 rounded bg-white focus:ring-2 focus:ring-blue-500"
                        required={attribute.isRequired}
                      >
                        <option value="">Select {attribute.name}</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Product Selection Button */
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product</h3>
          <p className="text-gray-500 mb-4">Choose from your product catalog or enter manually</p>
          <button
            onClick={() => setShowProductModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ zIndex: 9999 }}>
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowProductModal(false)}
              aria-hidden="true"
            ></div>

            {/* Modal panel */}
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Select Product</h3>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 -m-2"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="col-span-full text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <div className="text-gray-500">Loading products...</div>
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200 select-none"
                      >
                        <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                        {product.sku && (
                          <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                        )}
                        <p className="text-sm text-blue-600 font-medium mb-2">{getPriceDisplay(product)}</p>
                        {product.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                        )}
                        <div className="mt-2 flex justify-between items-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.productType === 'SIMPLE' ? 'bg-green-100 text-green-800' :
                            product.productType === 'CONFIGURABLE' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {product.productType}
                          </span>
                          {product.category && (
                            <span className="text-xs text-gray-500">{product.category}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <div className="text-gray-500">No products found</div>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}