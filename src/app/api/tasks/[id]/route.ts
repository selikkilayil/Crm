import { NextRequest } from 'next/server'
import { TaskHandlers } from '@/domains/tasks'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return TaskHandlers.getTaskById(id, request)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return TaskHandlers.updateTask(id, request)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return TaskHandlers.deleteTask(id, request)
}