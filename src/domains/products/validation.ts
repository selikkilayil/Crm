import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  productType: z.enum(['SIMPLE', 'CONFIGURABLE', 'BUNDLE']).default('SIMPLE'),
  pricingType: z.enum(['FIXED', 'CALCULATED', 'TIER_BASED']).default('FIXED'),
  basePrice: z.number().min(0).default(0),
  costPrice: z.number().min(0).optional().nullable(),
  calculationFormula: z.string().optional().nullable(),
  trackInventory: z.boolean().default(false),
  currentStock: z.number().min(0).optional().nullable(),
  minStockLevel: z.number().min(0).optional().nullable(),
  unit: z.string().max(50).default('piece'),
  defaultTaxRate: z.number().min(0).max(100).default(18),
  attributes: z.array(z.any()).optional(),
  variants: z.array(z.any()).optional(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const productFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  productType: z.string().optional(),
})

export function validateProduct(data: unknown) {
  return createProductSchema.safeParse(data)
}

export function validateProductUpdate(data: unknown) {
  return updateProductSchema.safeParse(data)
}

export function validateProductFilters(data: unknown) {
  return productFiltersSchema.safeParse(data)
}