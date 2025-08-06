export interface Permission {
  id: string
  resource: string
  action: string
  description?: string
  category?: string
}

export interface Role {
  id: string
  name: string
  description?: string
  isSystem: boolean
  isActive: boolean
  userCount: number
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface RoleFormData {
  name: string
  description: string
  permissions: string[]
}