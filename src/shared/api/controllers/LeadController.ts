import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { LeadStatus } from '@prisma/client'
import { BaseController } from '../BaseController'
import { LeadRepository } from '@/shared/repositories'
import { AuthMiddleware, ValidationMiddleware, ErrorHandler, NotFoundError } from '../middleware'

// Validation schemas
const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.nativeEnum(LeadStatus),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedUserId: z.string().optional(),
  tagIds: z.array(z.string()).optional()
})

const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assignedUserId: z.string().optional(),
  tagIds: z.array(z.string()).optional()
})

const querySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  assignedUserId: z.string().optional(),
  tagIds: z.string().optional().transform(val => val ? val.split(',') : undefined),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(100, parseInt(val) || 10)).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export class LeadController extends BaseController {
  private leadRepository = new LeadRepository()

  async handleGet(request: NextRequest, context?: { params: { id: string } }): Promise<NextResponse> {
    return ErrorHandler.withErrorHandling(async () => {
      return AuthMiddleware.requireAuth(request, async (authContext) => {
        if (context?.params?.id) {
          // Get single lead
          const lead = await this.leadRepository.findById(context.params.id)
          if (!lead) {
            throw new NotFoundError('Lead')
          }
          return this.createSuccessResponse(lead)
        } else {
          // Get leads list with filtering and pagination
          return ValidationMiddleware.withValidation(
            request,
            { querySchema },
            async ({ query }) => {
              const { search, status, assignedUserId, tagIds, page = 1, limit = 10, sortBy, sortOrder } = query || {}
              
              const [leads, total] = await Promise.all([
                this.leadRepository.findMany({ search, status, assignedUserId, tagIds, page, limit, sortBy, sortOrder }),
                this.leadRepository.count({ search, status, assignedUserId, tagIds })
              ])

              return this.createPaginatedResponse(leads, { page, limit, total })
            }
          )
        }
      })
    }) as Promise<NextResponse>
  }

  async handlePost(request: NextRequest): Promise<NextResponse> {
    return ErrorHandler.withErrorHandling(async () => {
      return AuthMiddleware.requireAuth(request, async (authContext) => {
        return ValidationMiddleware.withValidation(
          request,
          { bodySchema: createLeadSchema },
          async ({ body }) => {
            if (!body) throw new Error('Request body is required')

            const lead = await this.leadRepository.create(body)
            return this.createSuccessResponse(lead, 'Lead created successfully')
          }
        )
      })
    }) as Promise<NextResponse>
  }

  async handlePut(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
    return ErrorHandler.withErrorHandling(async () => {
      return AuthMiddleware.requireAuth(request, async (authContext) => {
        const { id } = context.params

        // Check if lead exists
        const existingLead = await this.leadRepository.findById(id)
        if (!existingLead) {
          throw new NotFoundError('Lead')
        }

        return ValidationMiddleware.withValidation(
          request,
          { bodySchema: updateLeadSchema },
          async ({ body }) => {
            if (!body) throw new Error('Request body is required')

            const lead = await this.leadRepository.update(id, body)
            return this.createSuccessResponse(lead, 'Lead updated successfully')
          }
        )
      })
    }) as Promise<NextResponse>
  }

  async handleDelete(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
    return ErrorHandler.withErrorHandling(async () => {
      return AuthMiddleware.requireAuth(request, async (authContext) => {
        const { id } = context.params

        // Check if lead exists
        const existingLead = await this.leadRepository.findById(id)
        if (!existingLead) {
          throw new NotFoundError('Lead')
        }

        await this.leadRepository.delete(id)
        return this.createSuccessResponse(null, 'Lead deleted successfully')
      })
    }) as Promise<NextResponse>
  }

  async handleConvertToCustomer(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
    return ErrorHandler.withErrorHandling(async () => {
      return AuthMiddleware.requireAuth(request, async (authContext) => {
        const { id } = context.params

        // Check if lead exists
        const existingLead = await this.leadRepository.findById(id)
        if (!existingLead) {
          throw new NotFoundError('Lead')
        }

        const lead = await this.leadRepository.convertToCustomer(id)
        return this.createSuccessResponse(lead, 'Lead converted to customer successfully')
      })
    }) as Promise<NextResponse>
  }
}