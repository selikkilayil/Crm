import { prisma } from '@/lib/prisma'

export interface CreateCustomerData {
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  notes?: string
  billingAddress?: string
  shippingAddress?: string
  createdById?: string
}

export interface UpdateCustomerData {
  name?: string
  email?: string
  phone?: string
  company?: string
  website?: string
  notes?: string
  billingAddress?: string
  shippingAddress?: string
}

export class CustomerService {
  async getCustomers(options: {
    search?: string | null
    page?: number
    limit?: number
    where?: any
  } = {}) {
    const { search, page = 1, limit = 10, where: additionalWhere } = options
    
    let whereClause: any = { ...additionalWhere }
    
    if (search) {
      const searchConditions = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
      
      if (whereClause.OR) {
        // If there are existing OR conditions, combine them
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

    return prisma.customer.findMany({
      where: whereClause,
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        activities: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            description: true,
            createdAt: true,
          },
        },
        quotations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            quotationNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })
  }

  async getCustomerById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            description: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        quotations: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            quotationNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async createCustomer(data: CreateCustomerData) {
    // Check if customer already exists with this email
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: data.email },
    })
    
    if (existingCustomer) {
      throw new Error('Customer with this email already exists')
    }

    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        website: data.website,
        notes: data.notes,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        createdById: data.createdById,
      },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        activities: {
          select: {
            id: true,
            type: true,
            description: true,
            createdAt: true,
          },
        },
        quotations: {
          select: {
            id: true,
            quotationNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async updateCustomer(id: string, data: UpdateCustomerData) {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({ where: { id } })
    if (!existingCustomer) {
      throw new Error('Customer not found')
    }

    // Check if email is taken by another customer
    if (data.email) {
      const emailTaken = await prisma.customer.findFirst({
        where: {
          email: data.email,
          NOT: { id }
        }
      })
      
      if (emailTaken) {
        throw new Error('Email already in use')
      }
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.company !== undefined) updateData.company = data.company
    if (data.website !== undefined) updateData.website = data.website
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.billingAddress !== undefined) updateData.billingAddress = data.billingAddress
    if (data.shippingAddress !== undefined) updateData.shippingAddress = data.shippingAddress

    return prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        activities: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            description: true,
            createdAt: true,
          },
        },
        quotations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            quotationNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    })
  }

  async deleteCustomer(id: string) {
    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({ where: { id } })
    if (!existingCustomer) {
      throw new Error('Customer not found')
    }

    return prisma.customer.delete({
      where: { id },
    })
  }
}