import { z } from 'zod'
import { LeadStatus } from '@prisma/client'

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
})

export const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
  isArchived: z.boolean().optional(),
})

export function validateLead(data: any) {
  return createLeadSchema.safeParse(data)
}

export function validateLeadUpdate(data: any) {
  return updateLeadSchema.safeParse(data)
}