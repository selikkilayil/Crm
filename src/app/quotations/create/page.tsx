'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'
import ProductSelector from '@/components/ProductSelector'
import apiClient, { productApi } from '@/lib/api-client'

interface Customer {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  isArchived?: boolean
}

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
  minValue?: number
  maxValue?: number
  defaultValue?: string
  unit?: string
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

interface QuotationItem {
  productId?: string
  variantId?: string
  productName: string
  description?: string
  configuration?: any
  quantity: number
  unitPrice: number
  calculatedPrice?: number
  discount: number
  taxPercent: number
  notes?: string
}

const calculateItemTotal = (item: QuotationItem) => {
  const lineSubtotal = item.quantity * item.unitPrice
  const discountAmount = (lineSubtotal * item.discount) / 100
  const taxableAmount = lineSubtotal - discountAmount
  const taxAmount = (taxableAmount * item.taxPercent) / 100
  return taxableAmount + taxAmount
}

export default function CreateQuotationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    customerId: '',
    validUntil: '',
    paymentTerms: '',
    deliveryTerms: '',
    currency: 'INR',
    notes: '',
    termsConditions: '',
  })
  
  const [items, setItems] = useState<QuotationItem[]>([
    { productName: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxPercent: 0, configuration: {} }
  ])

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
    fetchSettings()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await apiClient.get('/api/customers')
      
      if (Array.isArray(data)) {
        const activeCustomers = data.filter((c: Customer) => !c.isArchived)
        setCustomers(activeCustomers)
      } else {
        console.error('Customers data is not an array:', data)
        setCustomers([])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll({ isActive: true }) as any
      setProducts(response.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/pdf')
      if (response.ok) {
        const settingsData = await response.json()
        setSettings(settingsData)
        
        // Calculate default validity date
        const validityDate = new Date()
        validityDate.setDate(validityDate.getDate() + (settingsData.defaultValidityDays || 30))
        
        // Update form with default values
        setFormData(prev => ({
          ...prev,
          validUntil: validityDate.toISOString().split('T')[0],
          paymentTerms: settingsData.defaultPaymentTerms || '',
          deliveryTerms: settingsData.defaultDeliveryTerms || '',
          currency: settingsData.defaultCurrency || 'INR',
          termsConditions: settingsData.defaultTermsConditions || '',
        }))
        
        // Update default tax rate for new items
        setItems([
          { productName: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxPercent: Number(settingsData.defaultTaxRate) || 0 }
        ])
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const addItem = () => {
    const defaultTaxRate = settings ? Number(settings.defaultTaxRate) || 0 : 0
    setItems([...items, { productName: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxPercent: defaultTaxRate, configuration: {} }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    console.log(`Updating item ${index}, field: ${field}, value:`, value, typeof value)
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    console.log('Updated item:', updatedItems[index])
    console.log('All items after update:', updatedItems.map(item => ({ 
      quantity: item.quantity, 
      unitPrice: item.unitPrice, 
      discount: item.discount, 
      taxPercent: item.taxPercent 
    })))
    setItems(updatedItems)
  }

  const selectProduct = async (index: number, productId: string) => {
    if (!productId) {
      // Clear product selection
      updateItem(index, 'productId', undefined)
      updateItem(index, 'productName', '')
      updateItem(index, 'description', '')
      updateItem(index, 'unitPrice', 0)
      updateItem(index, 'taxPercent', settings ? Number(settings.defaultTaxRate) || 0 : 0)
      updateItem(index, 'configuration', undefined)
      return
    }

    const product = products.find(p => p.id === productId)
    if (!product) return

    // Update basic product info
    updateItem(index, 'productId', productId)
    updateItem(index, 'productName', product.name)
    updateItem(index, 'description', product.description || '')
    updateItem(index, 'taxPercent', Number(product.defaultTaxRate))

    // Convert Decimal to number properly for price
    const basePrice = typeof product.basePrice === 'object' ? 
      parseFloat(product.basePrice.toString()) : 
      Number(product.basePrice)

    // For simple products, set price directly
    if (product.productType === 'SIMPLE' && product.pricingType === 'FIXED') {
      updateItem(index, 'unitPrice', basePrice)
    } else {
      // For configurable/calculated products, start with base price
      updateItem(index, 'unitPrice', basePrice)
    }

    // Initialize configuration for configurable products
    if (product.productType === 'CONFIGURABLE' || product.productType === 'CALCULATED') {
      const defaultConfig: any = {}
      product.attributes.forEach(attr => {
        if (attr.defaultValue) {
          defaultConfig[attr.name.toLowerCase()] = attr.defaultValue
        }
      })
      updateItem(index, 'configuration', defaultConfig)
      
      // Calculate price with default configuration
      setTimeout(() => calculatePrice(index), 100)
    }
  }

  const calculatePrice = async (index: number) => {
    const item = items[index]
    if (!item.productId) return

    try {
      const response = await productApi.calculate(
        item.productId,
        item.configuration || {},
        item.quantity
      ) as any

      if (response.data) {
        updateItem(index, 'unitPrice', response.data.unitPrice)
        updateItem(index, 'calculatedPrice', response.data.unitPrice)
        
        // Show any calculation errors
        if (response.data.errors && response.data.errors.length > 0) {
          console.warn('Price calculation warnings:', response.data.errors)
        }
      }
    } catch (error) {
      console.error('Error calculating price:', error)
    }
  }

  const updateConfiguration = (index: number, attrName: string, value: any) => {
    const updatedItems = [...items]
    const config = updatedItems[index].configuration || {}
    config[attrName.toLowerCase()] = value
    updatedItems[index].configuration = config
    setItems(updatedItems)

    // Recalculate price if it's a calculated product
    const item = updatedItems[index]
    const product = products.find(p => p.id === item.productId)
    if (product && (product.pricingType === 'CALCULATED' || product.productType === 'CALCULATED')) {
      calculatePrice(index)
    }
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalTax = 0
    let totalDiscount = 0

    items.forEach(item => {
      const lineSubtotal = item.quantity * item.unitPrice
      const discountAmount = (lineSubtotal * item.discount) / 100
      const taxAmount = ((lineSubtotal - discountAmount) * item.taxPercent) / 100
      
      subtotal += lineSubtotal
      totalDiscount += discountAmount
      totalTax += taxAmount
    })

    const grandTotal = subtotal - totalDiscount + totalTax

    return { subtotal, totalTax, totalDiscount, grandTotal }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId) {
      alert('Please select a customer')
      return
    }

    if (items.some(item => !item.productName.trim())) {
      alert('Please fill in all product names')
      return
    }

    const totals = calculateTotals()
    
    const quotationData = {
      ...formData,
      items: items.map(item => ({
        productId: item.productId || undefined,
        variantId: item.variantId || undefined,
        productName: item.productId ? undefined : item.productName, // Only set if not using product
        description: item.description,
        configuration: item.configuration,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        calculatedPrice: item.calculatedPrice,
        discount: item.discount,
        taxPercent: item.taxPercent,
        subtotal: calculateItemTotal(item),
        notes: item.notes
      })),
      subtotal: totals.subtotal,
      totalTax: totals.totalTax,
      totalDiscount: totals.totalDiscount,
      grandTotal: totals.grandTotal,
      createdById: user?.id,
    }

    setSubmitting(true)

    try {
      const response = await apiClient.post('/api/quotations', quotationData)
      console.log('Quotation created:', response)
      router.push('/quotations')
    } catch (error) {
      console.error('Error creating quotation:', error)
      alert('Failed to create quotation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const totals = useMemo(() => {
    const calculated = calculateTotals()
    console.log('Totals recalculated:', calculated, 'Items count:', items.length)
    return calculated
  }, [items])

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
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <h1 className="text-3xl font-bold text-gray-900">Create Quotation</h1>
                <p className="text-gray-600 mt-2">Generate a new quotation for your customer</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer *
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.company && `(${customer.company})`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 50% advance, 50% on completion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Terms
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryTerms}
                    onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 15-20 working days"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Item
                </button>
              </div>

              <div className="space-y-6">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No items added yet. Click "Add Item" to get started.</p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <QuotationItemEditor
                      key={index}
                      item={item}
                      index={index}
                      products={products}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                      onSelectProduct={selectProduct}
                      onUpdateConfiguration={updateConfiguration}
                      onCalculatePrice={calculatePrice}
                      canRemove={items.length > 1}
                    />
                  ))
                )}
              </div>

              {/* Totals */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-full max-w-md">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quotation Summary</h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Subtotal:</span>
                          <span className="text-sm font-medium">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Discount:</span>
                          <span className="text-sm font-medium text-red-600">-₹{totals.totalDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Tax:</span>
                          <span className="text-sm font-medium">₹{totals.totalTax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                            <span className="text-xl font-bold text-blue-600">₹{totals.grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional notes for this quotation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.termsConditions}
                    onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Terms and conditions for this quotation"
                  />
                </div>
              </div>
            </div>

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
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Quotation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}

function QuotationItemEditor({
  item,
  index,
  products,
  onUpdate,
  onRemove,
  onSelectProduct,
  onUpdateConfiguration,
  onCalculatePrice,
  canRemove
}: {
  item: QuotationItem
  index: number
  products: Product[]
  onUpdate: (index: number, field: string, value: any) => void
  onRemove: (index: number) => void
  onSelectProduct: (index: number, productId: string) => void
  onUpdateConfiguration: (index: number, attrName: string, value: any) => void
  onCalculatePrice: (index: number) => void
  canRemove: boolean
}) {
  const selectedProduct = item.productId ? products.find(p => p.id === item.productId) : null

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Item {index + 1}</h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Product Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Selection
        </label>
        <ProductSelector
          selectedProductId={item.productId}
          selectedVariantId={item.variantId}
          configuration={item.configuration}
          onProductSelect={(product, variant, configuration) => {
            if (product) {
              console.log('Product selected:', product.name, 'Base Price:', product.basePrice, 'Variant:', variant)
              onUpdate(index, 'productId', product.id)
              onUpdate(index, 'productName', product.name)
              
              // Convert Decimal to number properly for price
              let price = 0
              if (variant?.price) {
                price = typeof variant.price === 'object' ? 
                  parseFloat(variant.price.toString()) : 
                  Number(variant.price)
              } else {
                price = typeof product.basePrice === 'object' ? 
                  parseFloat(product.basePrice.toString()) : 
                  Number(product.basePrice)
              }
              
              onUpdate(index, 'unitPrice', price)
              onUpdate(index, 'taxPercent', Number(product.defaultTaxRate))
              
              if (variant) {
                onUpdate(index, 'variantId', variant.id)
              } else {
                onUpdate(index, 'variantId', undefined)
              }
              
              if (configuration) {
                onUpdate(index, 'configuration', configuration)
              }
              
              // Trigger price calculation for configurable/calculated products
              if (product.productType === 'CONFIGURABLE' || product.productType === 'CALCULATED') {
                setTimeout(() => onCalculatePrice(index), 100)
              }
            } else {
              // Clear product selection
              onUpdate(index, 'productId', undefined)
              onUpdate(index, 'variantId', undefined)
              onUpdate(index, 'productName', '')
              onUpdate(index, 'unitPrice', 0)
              onUpdate(index, 'configuration', {})
            }
          }}
          onConfigurationChange={(configuration) => {
            onUpdate(index, 'configuration', configuration)
            // Recalculate price for calculated products
            if (selectedProduct && selectedProduct.pricingType === 'CALCULATED') {
              setTimeout(() => onCalculatePrice(index), 100)
            }
          }}
        />
      </div>

      {/* Manual Product Entry (if no product selected) */}
      {!item.productId && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manual Product Entry
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={item.productName}
                onChange={(e) => onUpdate(index, 'productName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <textarea
                value={item.description || ''}
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Product description"
                rows={2}
              />
            </div>
          </div>
        </div>
      )}

      {/* Pricing and Calculation */}
      <div className="space-y-4 mb-4">
        {/* First Row: Quantity and Unit Price */}  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              step="0.001"
              value={item.quantity}
              onChange={(e) => {
                onUpdate(index, 'quantity', parseFloat(e.target.value) || 0)
                // Recalculate price if it's a calculated product
                if (selectedProduct && selectedProduct.pricingType === 'CALCULATED') {
                  setTimeout(() => onCalculatePrice(index), 100)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={item.unitPrice}
              onChange={(e) => onUpdate(index, 'unitPrice', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        {/* Second Row: Discount, Tax, and Line Total */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={item.discount}
              onChange={(e) => onUpdate(index, 'discount', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={item.taxPercent}
              onChange={(e) => onUpdate(index, 'taxPercent', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Line Total
            </label>
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm font-semibold text-blue-900">
              ₹{calculateItemTotal(item).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={item.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Additional description or notes for this item"
        />
      </div>
    </div>
  )
}

function ProductAttributeInput({
  attribute,
  value,
  onChange
}: {
  attribute: ProductAttribute
  value: any
  onChange: (value: any) => void
}) {
  switch (attribute.type) {
    case 'SELECT':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {attribute.name} {attribute.isRequired && '*'}
          </label>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
        </div>
      )

    case 'NUMBER':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {attribute.name} {attribute.isRequired && '*'} {attribute.unit && `(${attribute.unit})`}
          </label>
          <input
            type="number"
            step="0.001"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || '')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            min={attribute.minValue}
            max={attribute.maxValue}
            required={attribute.isRequired}
          />
        </div>
      )

    case 'DIMENSION':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {attribute.name} {attribute.isRequired && '*'} {attribute.unit && `(${attribute.unit})`}
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.001"
              value={value?.width || ''}
              onChange={(e) => onChange({ ...value, width: parseFloat(e.target.value) || '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Width"
              required={attribute.isRequired}
            />
            <span className="flex items-center text-gray-500">×</span>
            <input
              type="number"
              step="0.001"
              value={value?.height || ''}
              onChange={(e) => onChange({ ...value, height: parseFloat(e.target.value) || '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Height"
              required={attribute.isRequired}
            />
          </div>
        </div>
      )

    case 'BOOLEAN':
      return (
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => onChange(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              {attribute.name} {attribute.isRequired && '*'}
            </span>
          </label>
        </div>
      )

    default: // TEXT
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {attribute.name} {attribute.isRequired && '*'}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required={attribute.isRequired}
          />
        </div>
      )
  }
}