export interface Customer {
  id: string
  name: string
  email: string
  company?: string | null
  phone?: string | null
  billingAddress?: string | null
  shippingAddress?: string | null
  gstin?: string | null
}

export interface CreatedBy {
  id: string
  name: string
  email: string
}

export interface Product {
  id: string
  name: string
  sku: string | null
  unit: string
  category: string | null
  productType: string
  attributes?: any[]
  options?: any[]
}

export interface QuotationItem {
  id: string
  productId?: string | null
  variantId?: string | null
  productName: string
  description?: string | null
  configuration?: any
  quantity: number
  unitPrice: number
  calculatedPrice?: number | null
  discount: number
  taxPercent: number
  subtotal: number
  notes?: string | null
  product?: Product
}

export interface Quotation {
  id: string
  quotationNumber: string
  date: string
  validUntil?: string | null
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  paymentTerms?: string | null
  deliveryTerms?: string | null
  currency: string
  subtotal: number
  totalTax: number
  totalDiscount: number
  grandTotal: number
  notes?: string | null
  termsConditions?: string | null
  customer: Customer
  createdBy: CreatedBy
  items: QuotationItem[]
  createdAt: string
  updatedAt: string
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export interface QuotationStatusInfo {
  value: string
  label: string
  color: string
  icon: string
}

export const quotationStatuses: QuotationStatusInfo[] = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: '📝' },
  { value: 'SENT', label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: '📤' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'bg-green-100 text-green-800', icon: '✅' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '❌' },
  { value: 'EXPIRED', label: 'Expired', color: 'bg-orange-100 text-orange-800', icon: '⏰' },
]

export interface CreateQuotationRequest {
  customerId: string
  validUntil?: string
  paymentTerms?: string
  deliveryTerms?: string
  currency?: string
  notes?: string
  termsConditions?: string
  items: CreateQuotationItemRequest[]
}

export interface CreateQuotationItemRequest {
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

export interface UpdateQuotationRequest {
  status?: QuotationStatus
  validUntil?: string
  paymentTerms?: string
  deliveryTerms?: string
  currency?: string
  notes?: string
  termsConditions?: string
  items?: CreateQuotationItemRequest[]
}