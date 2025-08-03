'use client'

import { useState, useEffect, useCallback } from 'react'
import ProductSelector from './ProductSelector'
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
  attributes: any[]
  variants: any[]
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

interface QuotationItemRowProps {
  item: QuotationItem
  index: number
  onUpdate: (index: number, field: keyof QuotationItem, value: any) => void
  onRemove: (index: number) => void
  currency?: string
}

export default function QuotationItemRow({ 
  item, 
  index, 
  onUpdate, 
  onRemove,
  currency = '₹'
}: QuotationItemRowProps) {
  const [calculating, setCalculating] = useState(false)
  const [calculationError, setCalculationError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Always sync selectedProduct with item.productId
  useEffect(() => {
    if (item.productId && typeof item.productId === 'string') {
      // Find product from global list if available
      // @ts-ignore: products prop may be available in parent
      const products = (window as any).products || []
      const found = products.find((p: Product) => p.id === item.productId)
      if (found) setSelectedProduct(found)
    } else {
      setSelectedProduct(null)
    }
  }, [item.productId])

  // Calculate line totals
  const lineSubtotal = item.quantity * (item.calculatedPrice || item.unitPrice)
  const discountAmount = (lineSubtotal * item.discount) / 100
  const taxableAmount = lineSubtotal - discountAmount
  const taxAmount = (taxableAmount * item.taxPercent) / 100
  const lineTotal = taxableAmount + taxAmount

  // Debounced calculation function
  const calculatePrice = useCallback(async () => {
    if (!item.productId || !selectedProduct) return

    // Skip calculation for simple fixed-price products
    if (selectedProduct.pricingType === 'FIXED' && !selectedProduct.attributes?.length) {
      return
    }

    setCalculating(true)
    setCalculationError(null)

    try {
      const response = await productApi.calculate(
        item.productId, 
        item.configuration || {}, 
        item.quantity
      ) as any

      if (response.data) {
        const { unitPrice, totalPrice, taxRate, errors } = response.data
        
        // Update calculated price
        onUpdate(index, 'calculatedPrice', unitPrice)
        onUpdate(index, 'unitPrice', unitPrice)
        
        // Update tax rate if different
        if (taxRate && taxRate !== item.taxPercent) {
          onUpdate(index, 'taxPercent', taxRate)
        }

        // Show calculation errors if any
        if (errors && errors.length > 0) {
          setCalculationError(errors.join(', '))
        }
      }
    } catch (error) {
      console.error('Price calculation error:', error)
      setCalculationError('Failed to calculate price')
    } finally {
      setCalculating(false)
    }
  }, [item.productId, item.configuration, item.quantity, selectedProduct, index, onUpdate])

  // Auto-calculate when relevant fields change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (item.productId && selectedProduct) {
        calculatePrice()
      }
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [item.quantity, item.configuration, calculatePrice])

  const handleProductSelect = (product: Product | null, variant: any, configuration: any) => {
    if (product) {
      console.log('Product selected:', product.name, 'Base Price:', product.basePrice, 'Variant:', variant)
      
      setSelectedProduct(product)
      onUpdate(index, 'productId', product.id)
      onUpdate(index, 'productName', product.name)
      
      // Convert Decimal to number properly for price
      let price = 0
      if (variant?.price != null) {
        price = Number(variant.price)
      } else {
        price = product.basePrice != null ? Number(product.basePrice) : 0
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

      // Clear any previous calculation errors
      setCalculationError(null)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-gray-900">Item #{index + 1}</h4>
        <button
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Selection
          </label>
          <ProductSelector
            selectedProductId={item.productId}
            selectedVariantId={item.variantId}
            configuration={item.configuration}
            onProductSelect={handleProductSelect}
          />
          {calculationError && (
            <p className="text-sm text-red-600 mt-1">{calculationError}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity {selectedProduct?.unit && `(${selectedProduct.unit})`}
          </label>
          <input
            type="number"
            min="0"
            step="0.001"
            value={item.quantity}
            onChange={(e) => onUpdate(index, 'quantity', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Unit Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Price ({currency})
            {calculating && <span className="ml-2 text-blue-600 text-xs">Calculating...</span>}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.calculatedPrice || item.unitPrice}
            onChange={(e) => onUpdate(index, 'unitPrice', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={calculating}
          />
          {item.calculatedPrice && item.calculatedPrice !== item.unitPrice && (
            <p className="text-xs text-blue-600 mt-1">
              Auto-calculated from configuration
            </p>
          )}
        </div>

        {/* Discount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={item.discount}
            onChange={(e) => onUpdate(index, 'discount', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Tax */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tax (%)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.taxPercent}
            onChange={(e) => onUpdate(index, 'taxPercent', Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Notes */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={item.notes || ''}
            onChange={(e) => onUpdate(index, 'notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Additional notes for this item..."
          />
        </div>
      </div>

      {/* Line Total Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Subtotal:</span>
            <div className="font-medium">{currency}{lineSubtotal.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-600">Discount:</span>
            <div className="font-medium text-red-600">-{currency}{discountAmount.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-600">Tax:</span>
            <div className="font-medium">+{currency}{taxAmount.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-600">Total:</span>
            <div className="font-semibold text-lg text-blue-600">{currency}{lineTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}