import { User, UserRole, Prisma } from '@prisma/client'
import { BaseRepository } from './BaseRepository'

export interface UserWithRelations extends User {
  customRoles?: Array<{
    id: string
    name: string
    permissions: Array<{
      id: string
      resource: string
      action: string
    }>
  }>
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
  customRoleIds?: string[]
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: UserRole
  customRoleIds?: string[]
}

export class UserRepository extends BaseRepository<UserWithRelations, CreateUserInput, UpdateUserInput> {
  async findMany(options: {
    search?: string
    role?: UserRole
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<UserWithRelations[]> {
    const { search, role, page, limit, sortBy, sortOrder = 'desc' } = options
    
    const where = this.buildWhereClause({ role })
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    return this.db.user.findMany({
      where,
      include: {
        customRoles: {
          include: {
            permissions: true
          }
        }
      },
      orderBy: this.buildOrderBy(sortBy, sortOrder),
      ...this.buildPagination(page, limit)
    })
  }

  async findById(id: string): Promise<UserWithRelations | null> {
    return this.db.user.findUnique({
      where: { id },
      include: {
        customRoles: {
          include: {
            permissions: true
          }
        }
      }
    })
  }

  async findByEmail(email: string): Promise<UserWithRelations | null> {
    return this.db.user.findUnique({
      where: { email },
      include: {
        customRoles: {
          include: {
            permissions: true
          }
        }
      }
    })
  }

  async create(data: CreateUserInput): Promise<UserWithRelations> {
    const { customRoleIds, ...userData } = data
    
    return this.db.user.create({
      data: {
        ...userData,
        ...(customRoleIds && customRoleIds.length > 0 && {
          customRoles: {
            connect: customRoleIds.map(id => ({ id }))
          }
        })
      },
      include: {
        customRoles: {
          include: {
            permissions: true
          }
        }
      }
    })
  }

  async update(id: string, data: UpdateUserInput): Promise<UserWithRelations> {
    const { customRoleIds, ...userData } = data
    
    const updateData: any = userData
    
    if (customRoleIds !== undefined) {
      // Disconnect all current roles first, then connect new ones
      await this.db.user.update({
        where: { id },
        data: {
          customRoles: {
            set: []
          }
        }
      })
      
      if (customRoleIds.length > 0) {
        updateData.customRoles = {
          connect: customRoleIds.map(roleId => ({ id: roleId }))
        }
      }
    }

    return this.db.user.update({
      where: { id },
      data: updateData,
      include: {
        customRoles: {
          include: {
            permissions: true
          }
        }
      }
    })
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    return this.db.user.update({
      where: { id },
      data: { password: hashedPassword }
    })
  }

  async delete(id: string): Promise<UserWithRelations> {
    return this.softDelete('user', id)
  }

  async count(filters: { search?: string; role?: UserRole } = {}): Promise<number> {
    const where = this.buildWhereClause({ role: filters.role })
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    return this.db.user.count({ where })
  }

  async findByRole(role: UserRole): Promise<UserWithRelations[]> {
    return this.db.user.findMany({
      where: { 
        role,
        isArchived: false
      },
      include: {
        customRoles: {
          include: {
            permissions: true
          }
        }
      }
    })
  }
}