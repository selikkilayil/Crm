import { NextRequest } from 'next/server'
import { ProductHandlers } from '@/domains/products'

export async function GET(request: NextRequest) {
  return ProductHandlers.getProducts(request)
}

export async function POST(request: NextRequest) {
  return ProductHandlers.createProduct(request)
}