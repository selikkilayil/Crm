import { NextRequest } from 'next/server'
import { QuotationHandlers } from '@/domains/quotations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return QuotationHandlers.generateQuotationPDF(id, request)
}