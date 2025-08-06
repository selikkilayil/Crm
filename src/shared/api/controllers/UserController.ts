import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UserRole } from '@prisma/client'
import { BaseController } from '../BaseController'
import { UserRepository } from '@/shared/repositories'
import { AuthMiddleware, ValidationMiddleware, ErrorHandler, NotFoundError } from '../middleware'
import { hashPassword } from '@/shared/utils'

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole),
  customRoleIds: z.array(z.string()).optional()
})

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  customRoleIds: z.array(z.string()).optional()
})

const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const querySchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(100, parseInt(val) || 10)).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export class UserController extends BaseController {
  private userRepository = new UserRepository()

  async handleGet(request: NextRequest, context?: { params: { id: string } }): Promise<NextResponse> {
    return ErrorHandler.withErrorHandling(async () => {
      return AuthMiddleware.requireAuth(request, async (authContext) => {
        if (context?.params?.id) {
          // Get single user
          const user = await this.userRepository.findById(context.params.id)
          if (!user) {
            throw new NotFoundError('User')
          }
          return this.createSuccessResponse(user)
        } else {
          // Get users list with filtering and pagination
          return ValidationMiddleware.withValidation(
            request,
            { querySchema },
            async ({ query }) => {
              const { search, role, page = 1, limit = 10, sortBy, sortOrder } = query || {}
              
              const [users, total] = await Promise.all([
                this.userRepository.findMany({ search, role, page, limit, sortBy, sortOrder }),
                this.userRepository.count({ search, role })
              ])

              return this.createPaginatedResponse(users, { page, limit, total })
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
          { bodySchema: createUserSchema },
          async ({ body }) => {
            if (!body) throw new Error('Request body is required')

            // Hash the password
            const hashedPassword = await hashPassword(body.password)
            
            const user = await this.userRepository.create({
              ...body,
              password: hashedPassword
            })

            return this.createSuccessResponse(user, 'User created successfully')
          }
        )
      })
    }) as Promise<NextResponse>
  }

  async handlePut(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
    return ErrorHandler.withErrorHandling(async () => {
      return AuthMiddleware.requireAuth(request, async (authContext) => {
        const { id } = context.params

        // Check if user exists
        const existingUser = await this.userRepository.findById(id)
        if (!existingUser) {
          throw new NotFoundError('User')
        }

        return ValidationMiddleware.withValidation(
          request,
          { bodySchema: updateUserSchema },
          async ({ body }) => {
            if (!body) throw new Error('Request body is required')

            const user = await this.userRepository.update(id, body)
            return this.createSuccessResponse(user, 'User updated successfully')
          }
        )
      })
    }) as Promise<NextResponse>
  }

  async handleDelete(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
    return ErrorHandler.withErrorHandling(async () => {
      return AuthMiddleware.requireAuth(request, async (authContext) => {
        const { id } = context.params

        // Check if user exists
        const existingUser = await this.userRepository.findById(id)
        if (!existingUser) {
          throw new NotFoundError('User')
        }

        await this.userRepository.delete(id)
        return this.createSuccessResponse(null, 'User deleted successfully')
      })
    }) as Promise<NextResponse>
  }

  async handlePasswordUpdate(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse> {
    return ErrorHandler.withErrorHandling(async () => {
      return AuthMiddleware.requireAuth(request, async (authContext) => {
        const { id } = context.params

        // Check if user exists
        const existingUser = await this.userRepository.findById(id)
        if (!existingUser) {
          throw new NotFoundError('User')
        }

        return ValidationMiddleware.withValidation(
          request,
          { bodySchema: updatePasswordSchema },
          async ({ body }) => {
            if (!body) throw new Error('Request body is required')

            const hashedPassword = await hashPassword(body.password)
            await this.userRepository.updatePassword(id, hashedPassword)
            
            return this.createSuccessResponse(null, 'Password updated successfully')
          }
        )
      })
    }) as Promise<NextResponse>
  }
}