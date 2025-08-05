'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/shared/components'
import { PermissionGuard } from '@/shared/components'
import { NavBar } from '@/shared/components'
import { productApi } from '@/shared/services'
import { PERMISSIONS } from '@/lib/permissions'

interface ProductAttribute {
  name: string
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'DIMENSION' | 'BOOLEAN'
  isRequired: boolean
  isConfigurable: boolean
  minValue?: number
  maxValue?: number
  defaultValue?: string
  unit?: string
  options: AttributeOption[]
}

interface AttributeOption {
  value: string
  displayName: string
  priceModifier: number
  costModifier: number
  sortOrder: number
}

interface ProductVariant {
  sku?: string
  name?: string
  configuration: Record<string, any>
  price?: number
  costPrice?: number
  stock?: number
}

export default function CreateProductPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Basic product info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')
  const [productType, setProductType] = useState<'SIMPLE' | 'CONFIGURABLE' | 'CALCULATED'>('SIMPLE')
  const [pricingType, setPricingType] = useState<'FIXED' | 'PER_UNIT' | 'CALCULATED' | 'VARIANT_BASED'>('FIXED')
  const [basePrice, setBasePrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [calculationFormula, setCalculationFormula] = useState('')
  const [trackInventory, setTrackInventory] = useState(false)
  const [currentStock, setCurrentStock] = useState('')
  const [minStockLevel, setMinStockLevel] = useState('')
  const [unit, setUnit] = useState('piece')
  const [defaultTaxRate, setDefaultTaxRate] = useState('18')

  // Attributes
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [showAddAttribute, setShowAddAttribute] = useState(false)

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Product name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const productData = {
        name: name.trim(),
        description: description.trim() || null,
        sku: sku.trim() || null,
        category: category.trim() || null,
        productType,
        pricingType,
        basePrice: parseFloat(basePrice) || 0,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        calculationFormula: calculationFormula.trim() || null,
        trackInventory,
        currentStock: trackInventory && currentStock ? parseFloat(currentStock) : null,
        minStockLevel: trackInventory && minStockLevel ? parseFloat(minStockLevel) : null,
        unit: unit.trim(),
        defaultTaxRate: parseFloat(defaultTaxRate) || 18,
        attributes: attributes.length > 0 ? attributes : null,
        variants: variants.length > 0 ? variants : null
      }

      await productApi.create(productData)
      router.push('/products')
    } catch (err: any) {
      setError(err.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const addAttribute = () => {
    setAttributes([...attributes, {
      name: '',
      type: 'TEXT',
      isRequired: false,
      isConfigurable: true,
      options: []
    }])
    setShowAddAttribute(false)
  }

  const updateAttribute = (index: number, field: keyof ProductAttribute, value: any) => {
    const newAttributes = [...attributes]
    newAttributes[index] = { ...newAttributes[index], [field]: value }
    setAttributes(newAttributes)
  }

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const addAttributeOption = (attributeIndex: number) => {
    const newAttributes = [...attributes]
    newAttributes[attributeIndex].options.push({
      value: '',
      displayName: '',
      priceModifier: 0,
      costModifier: 0,
      sortOrder: newAttributes[attributeIndex].options.length
    })
    setAttributes(newAttributes)
  }

  const updateAttributeOption = (attributeIndex: number, optionIndex: number, field: keyof AttributeOption, value: any) => {
    const newAttributes = [...attributes]
    newAttributes[attributeIndex].options[optionIndex] = {
      ...newAttributes[attributeIndex].options[optionIndex],
      [field]: value
    }
    setAttributes(newAttributes)
  }

  const removeAttributeOption = (attributeIndex: number, optionIndex: number) => {
    const newAttributes = [...attributes]
    newAttributes[attributeIndex].options = newAttributes[attributeIndex].options.filter((_, i) => i !== optionIndex)
    setAttributes(newAttributes)
  }

  return (
    <AuthGuard>
      <PermissionGuard permission={PERMISSIONS.PRODUCTS_CREATE}>
        <div className="min-h-screen bg-gray-50">
          <NavBar currentPage="products" />
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
                  <p className="text-gray-600 mt-2">Add a new product to your catalog</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter SKU"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter category"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="piece">Piece</option>
                      <option value="sqft">Square Feet</option>
                      <option value="kg">Kilogram</option>
                      <option value="meter">Meter</option>
                      <option value="liter">Liter</option>
                      <option value="box">Box</option>
                      <option value="set">Set</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Type & Pricing */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Type & Pricing</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Type
                    </label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SIMPLE">Simple - Fixed product</option>
                      <option value="CONFIGURABLE">Configurable - Has variants</option>
                      <option value="CALCULATED">Calculated - Formula-based pricing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pricing Type
                    </label>
                    <select
                      value={pricingType}
                      onChange={(e) => setPricingType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="FIXED">Fixed Price</option>
                      <option value="PER_UNIT">Per Unit (sqft, kg, etc.)</option>
                      <option value="CALCULATED">Calculated by Formula</option>
                      <option value="VARIANT_BASED">Variant-based Pricing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  {pricingType === 'CALCULATED' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calculation Formula
                      </label>
                      <input
                        type="text"
                        value={calculationFormula}
                        onChange={(e) => setCalculationFormula(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., width * height * basePrice"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Use variables: width, height, length, area, quantity, basePrice
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={defaultTaxRate}
                      onChange={(e) => setDefaultTaxRate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="18"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Management */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Inventory Management</h2>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={trackInventory}
                      onChange={(e) => setTrackInventory(e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">Track inventory for this product</span>
                  </label>
                </div>

                {trackInventory && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Stock
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={currentStock}
                        onChange={(e) => setCurrentStock(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Stock Level
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={minStockLevel}
                        onChange={(e) => setMinStockLevel(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Attributes */}
              {(productType === 'CONFIGURABLE' || productType === 'CALCULATED') && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Product Attributes</h2>
                    <button
                      type="button"
                      onClick={addAttribute}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add Attribute
                    </button>
                  </div>

                  <div className="space-y-6">
                    {attributes.map((attribute, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Attribute {index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeAttribute(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Attribute Name
                            </label>
                            <input
                              type="text"
                              value={attribute.name}
                              onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Size, Color"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={attribute.type}
                              onChange={(e) => updateAttribute(index, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="TEXT">Text</option>
                              <option value="NUMBER">Number</option>
                              <option value="SELECT">Select</option>
                              <option value="MULTISELECT">Multi-select</option>
                              <option value="DIMENSION">Dimension</option>
                              <option value="BOOLEAN">Boolean</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={attribute.isRequired}
                              onChange={(e) => updateAttribute(index, 'isRequired', e.target.checked)}
                              className="mr-2"
                            />
                            Required
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={attribute.isConfigurable}
                              onChange={(e) => updateAttribute(index, 'isConfigurable', e.target.checked)}
                              className="mr-2"
                            />
                            Configurable
                          </label>
                        </div>

                        {(attribute.type === 'SELECT' || attribute.type === 'MULTISELECT') && (
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Options
                              </label>
                              <button
                                type="button"
                                onClick={() => addAttributeOption(index)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Add Option
                              </button>
                            </div>

                            <div className="space-y-3">
                              {attribute.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                  <div>
                                    <input
                                      type="text"
                                      value={option.value}
                                      onChange={(e) => updateAttributeOption(index, optionIndex, 'value', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Option value"
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="text"
                                      value={option.displayName}
                                      onChange={(e) => updateAttributeOption(index, optionIndex, 'displayName', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Display name"
                                    />
                                  </div>
                                  <div>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={option.priceModifier}
                                      onChange={(e) => updateAttributeOption(index, optionIndex, 'priceModifier', parseFloat(e.target.value) || 0)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Price modifier"
                                    />
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => removeAttributeOption(index, optionIndex)}
                                      className="px-3 py-2 text-red-600 hover:text-red-800"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {attributes.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No attributes added yet.</p>
                        <p className="text-sm mt-1">Attributes help define configurable properties like size, color, etc.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Variants */}
              {productType === 'CONFIGURABLE' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Product Variants</h2>
                      <p className="text-sm text-gray-500 mt-1">Define different variations of this product</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVariants([...variants, {
                        sku: '',
                        name: '',
                        configuration: {},
                        price: 0,
                        costPrice: 0,
                        stock: trackInventory ? 0 : undefined
                      }])}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      Add Variant
                    </button>
                  </div>

                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Variant {index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Variant SKU
                            </label>
                            <input
                              type="text"
                              value={variant.sku || ''}
                              onChange={(e) => {
                                const newVariants = [...variants]
                                newVariants[index].sku = e.target.value
                                setVariants(newVariants)
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., WIN-SM-RED"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Variant Name
                            </label>
                            <input
                              type="text"
                              value={variant.name || ''}
                              onChange={(e) => {
                                const newVariants = [...variants]
                                newVariants[index].name = e.target.value
                                setVariants(newVariants)
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Small Red Window"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price (₹)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={variant.price || ''}
                              onChange={(e) => {
                                const newVariants = [...variants]
                                newVariants[index].price = parseFloat(e.target.value) || 0
                                setVariants(newVariants)
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {variants.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No variants added yet.</p>
                        <p className="text-sm mt-1">Variants are different versions of the same product (e.g., different sizes, colors).</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PermissionGuard>
    </AuthGuard>
  )
}
