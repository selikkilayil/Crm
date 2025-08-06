import { z } from 'zod'

const quotationItemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  productName: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  configuration: z.any().optional(),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  calculatedPrice: z.number().optional(),
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  taxPercent: z.number().min(0, 'Tax percent cannot be negative'),
  notes: z.string().optional(),
})

export const createQuotationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  validUntil: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  currency: z.string().default('INR'),
  notes: z.string().optional(),
  termsConditions: z.string().optional(),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
  createdById: z.string().min(1, 'Created by is required'),
})

export const updateQuotationSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
  validUntil: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  termsConditions: z.string().optional(),
  items: z.array(quotationItemSchema).optional(),
})

export const quotationFiltersSchema = z.object({
  status: z.string().optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
})

export function validateCreateQuotation(data: any) {
  return createQuotationSchema.safeParse(data)
}

export function validateUpdateQuotation(data: any) {
  return updateQuotationSchema.safeParse(data)
}

export function validateQuotationFilters(data: any) {
  return quotationFiltersSchema.safeParse(data)
}