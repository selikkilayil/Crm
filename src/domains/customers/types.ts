export interface Customer {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  website?: string | null
  notes?: string | null
  billingAddress?: string | null
  shippingAddress?: string | null
  createdAt: Date
  updatedAt: Date
  tags?: Array<{
    id: string
    name: string
    color: string
  }>
  activities?: Array<{
    id: string
    type: string
    description: string
    createdAt: Date
    user?: {
      name: string
    }
  }>
  quotations?: Array<{
    id: string
    quotationNumber: string
    status: string
    totalAmount: number
    createdAt: Date
  }>
}

export interface CreateCustomerRequest {
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  notes?: string
  billingAddress?: string
  shippingAddress?: string
}

export interface UpdateCustomerRequest {
  name?: string
  email?: string
  phone?: string
  company?: string
  website?: string
  notes?: string
  billingAddress?: string
  shippingAddress?: string
}