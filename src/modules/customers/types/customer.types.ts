export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  billingAddress: string | null
  shippingAddress: string | null
  gstin: string | null
  notes: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
  leadId: string | null
  contacts?: Contact[]
  activities?: Activity[]
  tags?: Tag[]
}

export interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  isPrimary: boolean
}

export interface Activity {
  id: string
  type: string
  title: string
  description: string | null
  createdAt: string
  completedAt: string | null
}

export interface Tag {
  id: string
  name: string
  color: string
  description?: string | null
}

export interface CustomerFormData {
  name: string
  email: string
  phone: string
  company: string
  billingAddress: string
  shippingAddress: string
  gstin: string
  notes: string
}