import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  notes: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
})

export const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  notes: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
})

export function validateCustomer(data: any) {
  return createCustomerSchema.safeParse(data)
}

export function validateCustomerUpdate(data: any) {
  return updateCustomerSchema.safeParse(data)
}