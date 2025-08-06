import { UserRole } from '@prisma/client'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  customRoleId?: string | null
  customRole?: {
    id: string
    name: string
    description: string
  } | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date | null
  _count?: {
    assignedLeads: number
    assignedTasks: number
    createdTasks?: number
    createdActivities?: number
  }
}

export interface CreateUserRequest {
  name: string
  email: string
  role: UserRole
  customRoleId?: string
  password: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: UserRole
  customRoleId?: string
  isActive?: boolean
}

export interface UpdatePasswordRequest {
  password: string
}