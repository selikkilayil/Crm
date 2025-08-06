import { NextRequest } from 'next/server'
import { ProductHandlers } from '@/domains/products'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return ProductHandlers.getProductById(id, request)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return ProductHandlers.updateProduct(id, request)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return ProductHandlers.deleteProduct(id, request)
}