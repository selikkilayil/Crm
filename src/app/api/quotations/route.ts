import { NextRequest } from 'next/server'
import { QuotationHandlers } from '@/domains/quotations'

export async function GET(request: NextRequest) {
  return QuotationHandlers.getQuotations(request)
}

export async function POST(request: NextRequest) {
  return QuotationHandlers.createQuotation(request)
}