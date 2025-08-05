export interface User {
  id: string
  name: string
  email: string
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES'
  customRoleId?: string | null
  customRole?: {
    id: string
    name: string
    description?: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string | null
  _count?: {
    assignedLeads: number
    assignedTasks: number
  }
}

export interface CustomRole {
  id: string
  name: string
  description?: string
}

export interface UserFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'SUPERADMIN' | 'ADMIN' | 'MANAGER' | 'SALES'
  customRoleId?: string
}

export const roleColors = {
  SUPERADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMIN: 'bg-red-100 text-red-800 border-red-200',
  MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
  SALES: 'bg-green-100 text-green-800 border-green-200'
}

export const roleIcons = {
  SUPERADMIN: '⚡',
  ADMIN: '👑',
  MANAGER: '🎯', 
  SALES: '💼'
}