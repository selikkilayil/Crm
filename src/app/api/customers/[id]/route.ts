import { NextRequest } from 'next/server'
import { CustomerHandlers } from '@/domains/customers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return CustomerHandlers.getCustomerById(id, request)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return CustomerHandlers.updateCustomer(id, request)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return CustomerHandlers.deleteCustomer(id, request)
}