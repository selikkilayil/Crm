import { NextRequest } from 'next/server'
import { UserHandlers } from '@/domains/users'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return UserHandlers.updatePassword(id, request)
}