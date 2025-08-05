export interface Product {
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

export interface ProductAttribute {
  id: string
  name: string
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'DIMENSION' | 'BOOLEAN'
  isRequired: boolean
  isConfigurable: boolean
  options: AttributeOption[]
}

export interface AttributeOption {
  id: string
  value: string
  displayName: string | null
  priceModifier: number
  isActive: boolean
}

export interface ProductVariant {
  id: string
  sku: string | null
  name: string | null
  configuration: any
  price: number | null
  isActive: boolean
}

export interface ProductFormData {
  name: string
  description: string
  sku: string
  category: string
  productType: 'SIMPLE' | 'CONFIGURABLE' | 'CALCULATED'
  pricingType: 'FIXED' | 'PER_UNIT' | 'CALCULATED' | 'VARIANT_BASED'
  basePrice: number
  costPrice: number
  calculationFormula: string
  trackInventory: boolean
  currentStock: number
  minStockLevel: number
  unit: string
  defaultTaxRate: number
}