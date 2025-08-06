import { prisma } from '@/lib/prisma'
import { LeadStatus } from '@prisma/client'

export interface CreateLeadData {
  name: string
  email: string
  phone?: string
  company?: string
  source?: string
  notes?: string
  assignedToId?: string
  status?: LeadStatus
}

export interface UpdateLeadData {
  name?: string
  email?: string
  phone?: string
  company?: string
  status?: LeadStatus
  source?: string
  notes?: string
  assignedToId?: string
}

export class LeadService {
  async getLeads(whereClause: any = {}) {
    return prisma.lead.findMany({
      where: whereClause,
      include: {
        activities: true,
        customer: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getLeadById(id: string) {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        activities: true,
        customer: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    })
  }

  async createLead(data: CreateLeadData) {
    return prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        source: data.source,
        notes: data.notes,
        assignedToId: data.assignedToId,
        status: data.status || 'NEW',
      },
      include: {
        activities: true,
        customer: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    })
  }

  async updateLead(id: string, data: UpdateLeadData) {
    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({ where: { id } })
    if (!existingLead) {
      throw new Error('Lead not found')
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.company !== undefined) updateData.company = data.company
    if (data.status !== undefined) {
      updateData.status = data.status
      // Set convertedAt if status is being changed to CONVERTED
      if (data.status === 'CONVERTED') {
        updateData.convertedAt = new Date()
      }
    }
    if (data.source !== undefined) updateData.source = data.source
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId

    return prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        activities: true,
        customer: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    })
  }

  async deleteLead(id: string) {
    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({ where: { id } })
    if (!existingLead) {
      throw new Error('Lead not found')
    }

    return prisma.lead.delete({
      where: { id },
    })
  }
}