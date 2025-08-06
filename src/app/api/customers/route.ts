import { NextRequest } from 'next/server'
import { CustomerHandlers } from '@/domains/customers'

export async function GET(request: NextRequest) {
  return CustomerHandlers.getCustomers(request)
}

export async function POST(request: NextRequest) {
  return CustomerHandlers.createCustomer(request)
}