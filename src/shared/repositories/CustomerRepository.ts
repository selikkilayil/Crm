import { Customer, Prisma } from '@prisma/client'
import { BaseRepository } from './BaseRepository'

export interface CustomerWithRelations extends Customer {
  tags?: Array<{
    id: string
    name: string
    color: string
  }>
  activities?: Array<{
    id: string
    type: string
    description: string
    createdAt: Date
  }>
  quotations?: Array<{
    id: string
    quotationNumber: string
    status: string
    totalAmount: number
    createdAt: Date
  }>
}

export interface CreateCustomerInput {
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  notes?: string
  billingAddress?: string
  shippingAddress?: string
  tagIds?: string[]
}

export interface UpdateCustomerInput {
  name?: string
  email?: string
  phone?: string
  company?: string
  website?: string
  notes?: string
  billingAddress?: string
  shippingAddress?: string
  tagIds?: string[]
}

export class CustomerRepository extends BaseRepository<CustomerWithRelations, CreateCustomerInput, UpdateCustomerInput> {
  async findMany(options: {
    search?: string
    tagIds?: string[]
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<CustomerWithRelations[]> {
    const { search, tagIds, page, limit, sortBy, sortOrder = 'desc' } = options
    
    const where = this.buildWhereClause({})
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (tagIds && tagIds.length > 0) {
      where.tags = {
        some: {
          id: { in: tagIds }
        }
      }
    }

    return this.db.customer.findMany({
      where,
      include: {
        tags: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        quotations: {
          select: {
            id: true,
            quotationNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: this.buildOrderBy(sortBy, sortOrder),
      ...this.buildPagination(page, limit)
    })
  }

  async findById(id: string): Promise<CustomerWithRelations | null> {
    return this.db.customer.findUnique({
      where: { id },
      include: {
        tags: true,
        activities: {
          orderBy: { createdAt: 'desc' }
        },
        quotations: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  async create(data: CreateCustomerInput): Promise<CustomerWithRelations> {
    const { tagIds, ...customerData } = data
    
    return this.db.customer.create({
      data: {
        ...customerData,
        ...(tagIds && tagIds.length > 0 && {
          tags: {
            connect: tagIds.map(id => ({ id }))
          }
        })
      },
      include: {
        tags: true,
        activities: true,
        quotations: true
      }
    })
  }

  async update(id: string, data: UpdateCustomerInput): Promise<CustomerWithRelations> {
    const { tagIds, ...customerData } = data
    
    const updateData: any = customerData
    
    if (tagIds !== undefined) {
      // Disconnect all current tags first, then connect new ones
      await this.db.customer.update({
        where: { id },
        data: {
          tags: {
            set: []
          }
        }
      })
      
      if (tagIds.length > 0) {
        updateData.tags = {
          connect: tagIds.map(tagId => ({ id: tagId }))
        }
      }
    }

    return this.db.customer.update({
      where: { id },
      data: updateData,
      include: {
        tags: true,
        activities: true,
        quotations: true
      }
    })
  }

  async delete(id: string): Promise<CustomerWithRelations> {
    return this.softDelete('customer', id)
  }

  async count(filters: {
    search?: string
    tagIds?: string[]
  } = {}): Promise<number> {
    const where = this.buildWhereClause({})
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { company: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    if (filters.tagIds && filters.tagIds.length > 0) {
      where.tags = {
        some: {
          id: { in: filters.tagIds }
        }
      }
    }

    return this.db.customer.count({ where })
  }

  async findByEmail(email: string): Promise<CustomerWithRelations | null> {
    return this.db.customer.findUnique({
      where: { email },
      include: {
        tags: true,
        activities: true,
        quotations: true
      }
    })
  }

  async findByCompany(company: string): Promise<CustomerWithRelations[]> {
    return this.db.customer.findMany({
      where: { 
        company: { contains: company, mode: 'insensitive' },
        isArchived: false
      },
      include: {
        tags: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}