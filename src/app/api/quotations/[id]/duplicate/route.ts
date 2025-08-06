import { NextRequest } from 'next/server'
import { QuotationHandlers } from '@/domains/quotations'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return QuotationHandlers.duplicateQuotation(params.id, request)
}