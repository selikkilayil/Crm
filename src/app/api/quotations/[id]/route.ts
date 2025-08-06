import { NextRequest } from 'next/server'
import { QuotationHandlers } from '@/domains/quotations'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return QuotationHandlers.getQuotationById(params.id, request)
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return QuotationHandlers.updateQuotation(params.id, request)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return QuotationHandlers.deleteQuotation(params.id, request)
}