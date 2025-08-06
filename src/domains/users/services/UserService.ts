import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { UserRole } from '@prisma/client'

export interface CreateUserData {
  name: string
  email: string
  role: UserRole
  customRoleId?: string
  password: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: UserRole
  customRoleId?: string
  isActive?: boolean
}

export class UserService {
  async getUsers(whereClause: any = {}) {
    return prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedLeads: true,
            assignedTasks: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedLeads: true,
            assignedTasks: true,
            createdTasks: true,
            createdActivities: true,
          },
        },
      },
    })
  }

  async createUser(data: CreateUserData) {
    // Validate custom role if provided
    if (data.customRoleId) {
      const customRole = await prisma.customRole.findUnique({
        where: { id: data.customRoleId, isActive: true }
      })
      
      if (!customRole) {
        throw new Error('Invalid custom role')
      }
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })
    
    if (existingUser) {
      throw new Error('User with this email already exists')
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        customRoleId: data.customRoleId || null,
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedLeads: true,
            assignedTasks: true,
          },
        },
      },
    })
  }

  async updateUser(id: string, data: UpdateUserData) {
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.role !== undefined) updateData.role = data.role
    if (data.customRoleId !== undefined) updateData.customRoleId = data.customRoleId
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    // Check if email is taken by another user
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id }
        }
      })
      
      if (existingUser) {
        throw new Error('Email already in use')
      }
    }
    
    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedLeads: true,
            assignedTasks: true,
          },
        },
      },
    })
  }

  async deleteUser(id: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new Error('User not found')
    }

    // Instead of hard delete, we'll deactivate the user
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    })
  }

  async updatePassword(id: string, password: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new Error('User not found')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })
  }
}