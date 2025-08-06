export interface Product {
  id: string
  name: string
  description?: string | null
  sku?: string | null
  category?: string | null
  productType: 'SIMPLE' | 'CONFIGURABLE' | 'BUNDLE'
  pricingType: 'FIXED' | 'CALCULATED' | 'TIER_BASED'
  basePrice: number
  costPrice?: number | null
  calculationFormula?: string | null
  trackInventory: boolean
  currentStock?: number | null
  minStockLevel?: number | null
  unit: string
  defaultTaxRate: number
  isActive: boolean
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
  attributes?: ProductAttribute[]
  variants?: ProductVariant[]
  _count?: {
    quotationItems: number
  }
}

export interface ProductAttribute {
  id: string
  productId: string
  name: string
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'BOOLEAN' | 'RANGE'
  isRequired: boolean
  isConfigurable: boolean
  minValue?: number | null
  maxValue?: number | null
  defaultValue?: string | null
  unit?: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  options?: ProductAttributeOption[]
}

export interface ProductAttributeOption {
  id: string
  attributeId: string
  value: string
  displayName: string
  priceModifier: number
  costModifier: number
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  sku?: string | null
  name: string
  configuration: any
  price: number
  costPrice?: number | null
  stock?: number | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductRequest {
  name: string
  description?: string
  sku?: string
  category?: string
  productType?: 'SIMPLE' | 'CONFIGURABLE' | 'BUNDLE'
  pricingType?: 'FIXED' | 'CALCULATED' | 'TIER_BASED'
  basePrice?: number
  costPrice?: number
  calculationFormula?: string
  trackInventory?: boolean
  currentStock?: number
  minStockLevel?: number
  unit?: string
  defaultTaxRate?: number
  attributes?: any[]
  variants?: any[]
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  sku?: string
  category?: string
  productType?: 'SIMPLE' | 'CONFIGURABLE' | 'BUNDLE'
  pricingType?: 'FIXED' | 'CALCULATED' | 'TIER_BASED'
  basePrice?: number
  costPrice?: number
  calculationFormula?: string
  trackInventory?: boolean
  currentStock?: number
  minStockLevel?: number
  unit?: string
  defaultTaxRate?: number
  isActive?: boolean
}

export interface ProductFilters {
  search?: string
  category?: string
  isActive?: boolean
  productType?: string
}