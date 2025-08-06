import { LeadStatus } from '@prisma/client'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  status: LeadStatus
  source?: string | null
  notes?: string | null
  assignedToId?: string | null
  convertedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  assignedTo?: {
    id: string
    name: string
    email: string
  } | null
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
  }>
  customer?: any
}

export interface CreateLeadRequest {
  name: string
  email: string
  phone?: string
  company?: string
  source?: string
  notes?: string
  assignedToId?: string
  status?: LeadStatus
}

export interface UpdateLeadRequest {
  name?: string
  email?: string
  phone?: string
  company?: string
  status?: LeadStatus
  source?: string
  notes?: string
  assignedToId?: string
}