import { NextRequest } from 'next/server'
import { UserHandlers } from '@/domains/users'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return UserHandlers.getUserById(id)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return UserHandlers.updateUser(id, request)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return UserHandlers.deleteUser(id)
}