import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  details?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  message?: string
}

export interface RequestContext {
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
  params?: Record<string, string>
  searchParams?: Record<string, string>
}

export abstract class BaseController {
  protected createSuccessResponse<T>(data: T, message?: string): NextResponse {
    return NextResponse.json({
      data,
      message
    } as ApiResponse<T>)
  }

  protected createPaginatedResponse<T>(
    data: T[], 
    pagination: { page: number; limit: number; total: number }, 
    message?: string
  ): NextResponse {
    return NextResponse.json({
      data,
      pagination: {
        ...pagination,
        pages: Math.ceil(pagination.total / pagination.limit)
      },
      message
    } as PaginatedResponse<T>)
  }

  protected createErrorResponse(
    error: string, 
    status: number = 400, 
    details?: any
  ): NextResponse {
    return NextResponse.json({
      error,
      details
    } as ApiResponse, { status })
  }

  protected async validateRequest<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): Promise<{ isValid: boolean; data?: T; error?: string }> {
    try {
      const body = await request.json()
      const data = schema.parse(body)
      return { isValid: true, data }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: 'Validation failed',
          data: error.errors as any
        }
      }
      return {
        isValid: false,
        error: 'Invalid request body'
      }
    }
  }

  protected extractSearchParams(request: NextRequest): Record<string, string> {
    const searchParams: Record<string, string> = {}
    request.nextUrl.searchParams.forEach((value, key) => {
      searchParams[key] = value
    })
    return searchParams
  }

  protected extractPaginationParams(searchParams: Record<string, string>) {
    const page = parseInt(searchParams.page || '1')
    const limit = parseInt(searchParams.limit || '10')
    return { page: Math.max(1, page), limit: Math.min(100, Math.max(1, limit)) }
  }

  protected extractSortParams(searchParams: Record<string, string>) {
    const sortBy = searchParams.sortBy
    const sortOrder = (searchParams.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'
    return { sortBy, sortOrder }
  }

  protected async handleRequest<T>(
    request: NextRequest,
    handler: (context: RequestContext) => Promise<T>,
    options: {
      requireAuth?: boolean
      validationSchema?: z.ZodSchema<any>
    } = {}
  ): Promise<NextResponse> {
    try {
      // Extract context
      const searchParams = this.extractSearchParams(request)
      const context: RequestContext = {
        searchParams
      }

      // Validate request if schema provided
      if (options.validationSchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const validation = await this.validateRequest(request, options.validationSchema)
        if (!validation.isValid) {
          return this.createErrorResponse(validation.error!, 400, validation.data)
        }
        // Add validated data to context
        ;(context as any).validatedData = validation.data
      }

      // Execute handler
      const result = await handler(context)
      
      // Return success response
      if (Array.isArray(result) && 'pagination' in (result as any)) {
        const { data, pagination, ...rest } = result as any
        return this.createPaginatedResponse(data, pagination, rest.message)
      } else {
        return this.createSuccessResponse(result)
      }
    } catch (error: any) {
      console.error('API Error:', error)
      
      // Handle known error types
      if (error.message?.includes('not found')) {
        return this.createErrorResponse('Resource not found', 404)
      }
      
      if (error.message?.includes('already exists')) {
        return this.createErrorResponse('Resource already exists', 409)
      }
      
      if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
        return this.createErrorResponse('Insufficient permissions', 403)
      }
      
      // Generic error response
      return this.createErrorResponse(
        process.env.NODE_ENV === 'development' 
          ? error.message || 'Internal server error'
          : 'Internal server error',
        500
      )
    }
  }

  // Abstract methods for CRUD operations
  abstract handleGet(request: NextRequest, context?: { params: { id: string } }): Promise<NextResponse>
  abstract handlePost(request: NextRequest): Promise<NextResponse>
  abstract handlePut(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse>
  abstract handleDelete(request: NextRequest, context: { params: { id: string } }): Promise<NextResponse>
}