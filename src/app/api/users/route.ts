import { NextRequest } from 'next/server'
import { UserHandlers } from '@/domains/users'

export async function GET(request: NextRequest) {
  return UserHandlers.getUsers(request)
}

export async function POST(request: NextRequest) {
  return UserHandlers.createUser(request)
}