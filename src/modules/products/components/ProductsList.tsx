'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '../types'

interface ProductsListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

export default function ProductsList({ products, onEdit, onDelete }: ProductsListProps) {
  const router = useRouter()

  const getPriceDisplay = (product: Product) => {
    if (product.pricingType === 'CALCULATED') {
      return `₹${Number(product.basePrice)}/${product.unit} (calculated)`
    }
    if (product.pricingType === 'VARIANT_BASED') {
      return 'Variable pricing'
    }
    return `₹${Number(product.basePrice)}${product.pricingType === 'PER_UNIT' ? `/${product.unit}` : ''}`
  }

  const getTypeColor = (productType: string) => {
    switch (productType) {
      case 'SIMPLE':
        return 'bg-green-100 text-green-800'
      case 'CONFIGURABLE':
        return 'bg-blue-100 text-blue-800'
      case 'CALCULATED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                {product.sku && (
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                )}
              </div>
              <div className="ml-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(product.productType)}`}>
                  {product.productType}
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="mb-3">
              <p className="text-lg font-semibold text-blue-600">
                {getPriceDisplay(product)}
              </p>
              {product.category && (
                <p className="text-sm text-gray-500">{product.category}</p>
              )}
            </div>

            {/* Stock Info */}
            {product.trackInventory && (
              <div className="mb-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <span className={product.currentStock && product.currentStock < (product.minStockLevel || 0) ? 'text-red-600' : ''}>
                    {product.currentStock || 0} {product.unit}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {product._count.quotationItems} quotations
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(product)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}