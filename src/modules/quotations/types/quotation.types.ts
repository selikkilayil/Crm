export interface Customer {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
}

export interface QuotationItem {
  id?: string
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  discount: number
  taxPercent: number
  subtotal: number
}

export interface Quotation {
  id: string
  quotationNumber: string
  date: string
  validUntil?: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  paymentTerms?: string
  deliveryTerms?: string
  currency: string
  subtotal: number
  totalTax: number
  totalDiscount: number
  grandTotal: number
  notes?: string
  termsConditions?: string
  customer: Customer
  createdBy: {
    id: string
    name: string
    email: string
  }
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