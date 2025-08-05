export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  status: LeadStatus
  source: string | null
  value: number | null
  notes: string | null
  assignedToId: string | null
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  isArchived: boolean
  createdAt: string
  updatedAt: string
  activities?: Activity[]
  tags?: Tag[]
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

export interface LeadFilters {
  status?: LeadStatus
  assignedToId?: string
  source?: string
  search?: string
}

export interface LeadFormData {
  name: string
  email: string
  phone: string
  company: string
  status: LeadStatus
  source: string
  value: string
  notes: string
  assignedToId: string
}