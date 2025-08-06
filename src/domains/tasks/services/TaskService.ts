import { prisma } from '@/lib/prisma'
import { TaskStatus, TaskPriority } from '@prisma/client'

export interface CreateTaskData {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  assignedToId?: string | null
  leadId?: string | null
  customerId?: string | null
  createdById: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  completedAt?: string | null
  assignedToId?: string | null
  leadId?: string | null
  customerId?: string | null
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  assignedToId?: string
  leadId?: string
  customerId?: string
  search?: string
}

export class TaskService {
  async getTasks(options: {
    filters?: TaskFilters
    page?: number
    limit?: number
    where?: any
  } = {}) {
    const { filters = {}, page = 1, limit = 100, where: additionalWhere } = options
    
    let whereClause: any = { ...additionalWhere }
    
    // Apply filters
    if (filters.status) whereClause.status = filters.status
    if (filters.priority) whereClause.priority = filters.priority
    if (filters.assignedToId) whereClause.assignedToId = filters.assignedToId
    if (filters.leadId) whereClause.leadId = filters.leadId
    if (filters.customerId) whereClause.customerId = filters.customerId
    
    // Apply search filter
    if (filters.search) {
      const searchConditions = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
      
      if (whereClause.OR) {
        whereClause.AND = [
          { OR: whereClause.OR },
          { OR: searchConditions }
        ]
        delete whereClause.OR
      } else {
        whereClause.OR = searchConditions
      }
    }

    const skip = (page - 1) * limit

    return prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    })
  }

  async getTaskById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
      },
    })
  }

  async createTask(data: CreateTaskData) {
    // Validate assigned user exists if provided
    if (data.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: data.assignedToId }
      })
      
      if (!assignedUser) {
        throw new Error('Assigned user not found')
      }
    }

    // Validate lead exists if provided
    if (data.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: data.leadId }
      })
      
      if (!lead) {
        throw new Error('Lead not found')
      }
    }

    // Validate customer exists if provided
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId }
      })
      
      if (!customer) {
        throw new Error('Customer not found')
      }
    }

    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status || 'PENDING',
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignedToId: data.assignedToId,
        createdById: data.createdById,
        leadId: data.leadId,
        customerId: data.customerId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
      },
    })
  }

  async updateTask(id: string, data: UpdateTaskData) {
    // Check if task exists
    const existingTask = await prisma.task.findUnique({ where: { id } })
    if (!existingTask) {
      throw new Error('Task not found')
    }

    // Validate assigned user exists if provided
    if (data.assignedToId !== undefined && data.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: data.assignedToId }
      })
      
      if (!assignedUser) {
        throw new Error('Assigned user not found')
      }
    }

    // Validate lead exists if provided
    if (data.leadId !== undefined && data.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: data.leadId }
      })
      
      if (!lead) {
        throw new Error('Lead not found')
      }
    }

    // Validate customer exists if provided
    if (data.customerId !== undefined && data.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId }
      })
      
      if (!customer) {
        throw new Error('Customer not found')
      }
    }

    const updateData: any = {}
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) {
      updateData.status = data.status
      // Auto-set completedAt when marking as completed
      if (data.status === 'COMPLETED' && !data.completedAt) {
        updateData.completedAt = new Date()
      } else if (data.status !== 'COMPLETED') {
        updateData.completedAt = null
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId
    if (data.leadId !== undefined) updateData.leadId = data.leadId
    if (data.customerId !== undefined) updateData.customerId = data.customerId

    return prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
      },
    })
  }

  async updateTaskStatus(id: string, status: TaskStatus) {
    const updateData: any = { status }
    
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    } else {
      updateData.completedAt = null
    }

    return this.updateTask(id, updateData)
  }

  async deleteTask(id: string) {
    // Check if task exists
    const existingTask = await prisma.task.findUnique({ where: { id } })
    if (!existingTask) {
      throw new Error('Task not found')
    }

    return prisma.task.delete({
      where: { id },
    })
  }

  async getTasksByUser(userId: string, options?: {
    status?: TaskStatus
    priority?: TaskPriority
    limit?: number
  }) {
    const { status, priority, limit = 50 } = options || {}
    
    const whereClause: any = {
      OR: [
        { assignedToId: userId },
        { createdById: userId }
      ]
    }

    if (status) whereClause.status = status
    if (priority) whereClause.priority = priority

    return prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    })
  }

  async getTasksForLead(leadId: string) {
    return prisma.task.findMany({
      where: { leadId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })
  }

  async getTasksForCustomer(customerId: string) {
    return prisma.task.findMany({
      where: { customerId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })
  }
}