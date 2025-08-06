import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export abstract class BaseRepository<T = any, CreateInput = any, UpdateInput = any> {
  protected db: PrismaClient

  constructor() {
    this.db = prisma
  }

  abstract findMany(options?: any): Promise<T[]>
  abstract findById(id: string): Promise<T | null>
  abstract create(data: CreateInput): Promise<T>
  abstract update(id: string, data: UpdateInput): Promise<T>
  abstract delete(id: string): Promise<T>

  protected async softDelete(tableName: string, id: string): Promise<any> {
    const updateData = { isArchived: true, updatedAt: new Date() }
    // @ts-ignore - Dynamic table access
    return this.db[tableName].update({
      where: { id },
      data: updateData
    })
  }

  protected buildWhereClause(filters: Record<string, any> = {}): Record<string, any> {
    const where: Record<string, any> = { isArchived: false }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && key.includes('search')) {
          where.OR = where.OR || []
          // This would be customized per repository for specific search fields
          where.OR.push({
            name: { contains: value, mode: 'insensitive' }
          })
        } else {
          where[key] = value
        }
      }
    })

    return where
  }

  protected buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): Record<string, any> {
    if (!sortBy) return { createdAt: 'desc' }
    return { [sortBy]: sortOrder }
  }

  protected buildPagination(page?: number, limit?: number) {
    if (!page || !limit) return {}
    const skip = (page - 1) * limit
    return { skip, take: limit }
  }
}