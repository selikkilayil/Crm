import { Lead, LeadStatus, Prisma } from '@prisma/client'
import { BaseRepository } from './BaseRepository'

export interface LeadWithRelations extends Lead {
  assignedUser?: {
    id: string
    name: string
    email: string
  } | null
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
}

export interface CreateLeadInput {
  name: string
  email: string
  phone?: string
  company?: string
  status: LeadStatus
  source?: string
  notes?: string
  assignedUserId?: string
  tagIds?: string[]
}

export interface UpdateLeadInput {
  name?: string
  email?: string
  phone?: string
  company?: string
  status?: LeadStatus
  source?: string
  notes?: string
  assignedUserId?: string
  tagIds?: string[]
}

export class LeadRepository extends BaseRepository<LeadWithRelations, CreateLeadInput, UpdateLeadInput> {
  async findMany(options: {
    search?: string
    status?: LeadStatus
    assignedUserId?: string
    tagIds?: string[]
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<LeadWithRelations[]> {
    const { search, status, assignedUserId, tagIds, page, limit, sortBy, sortOrder = 'desc' } = options
    
    const where = this.buildWhereClause({ status, assignedUserId })
    
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

    return this.db.lead.findMany({
      where,
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: this.buildOrderBy(sortBy, sortOrder),
      ...this.buildPagination(page, limit)
    })
  }

  async findById(id: string): Promise<LeadWithRelations | null> {
    return this.db.lead.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true,
        activities: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  async create(data: CreateLeadInput): Promise<LeadWithRelations> {
    const { tagIds, ...leadData } = data
    
    return this.db.lead.create({
      data: {
        ...leadData,
        ...(tagIds && tagIds.length > 0 && {
          tags: {
            connect: tagIds.map(id => ({ id }))
          }
        })
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true,
        activities: true
      }
    })
  }

  async update(id: string, data: UpdateLeadInput): Promise<LeadWithRelations> {
    const { tagIds, ...leadData } = data
    
    const updateData: any = leadData
    
    if (tagIds !== undefined) {
      // Disconnect all current tags first, then connect new ones
      await this.db.lead.update({
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

    return this.db.lead.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true,
        activities: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  async delete(id: string): Promise<LeadWithRelations> {
    return this.softDelete('lead', id)
  }

  async count(filters: {
    search?: string
    status?: LeadStatus
    assignedUserId?: string
    tagIds?: string[]
  } = {}): Promise<number> {
    const where = this.buildWhereClause({ 
      status: filters.status, 
      assignedUserId: filters.assignedUserId 
    })
    
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

    return this.db.lead.count({ where })
  }

  async findByStatus(status: LeadStatus): Promise<LeadWithRelations[]> {
    return this.db.lead.findMany({
      where: { 
        status,
        isArchived: false
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findByAssignedUser(userId: string): Promise<LeadWithRelations[]> {
    return this.db.lead.findMany({
      where: { 
        assignedUserId: userId,
        isArchived: false
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tags: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async convertToCustomer(id: string): Promise<LeadWithRelations> {
    return this.update(id, { status: 'CONVERTED' })
  }
}