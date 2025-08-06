import { NextRequest } from 'next/server'
import { TaskHandlers } from '@/domains/tasks'

export async function GET(request: NextRequest) {
  return TaskHandlers.getTasks(request)
}

export async function POST(request: NextRequest) {
  return TaskHandlers.createTask(request)
}