import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: z.ZodError
}

export class ValidationMiddleware {
  static async validateBody<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): Promise<ValidationResult<T>> {
    try {
      const body = await request.json()
      const data = schema.parse(body)
      
      return {
        success: true,
        data
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error
        }
      }
      
      return {
        success: false,
        errors: new z.ZodError([{
          code: 'custom',
          path: [],
          message: 'Invalid request body format'
        }])
      }
    }
  }

  static async validateQuery<T>(
    request: NextRequest,
    schema: z.ZodSchema<T>
  ): Promise<ValidationResult<T>> {
    try {
      const searchParams: Record<string, string> = {}
      request.nextUrl.searchParams.forEach((value, key) => {
        searchParams[key] = value
      })
      
      const data = schema.parse(searchParams)
      
      return {
        success: true,
        data
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error
        }
      }
      
      return {
        success: false,
        errors: new z.ZodError([{
          code: 'custom',
          path: [],
          message: 'Invalid query parameters'
        }])
      }
    }
  }

  static createValidationErrorResponse(errors: z.ZodError): NextResponse {
    const formattedErrors = errors.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code
    }))

    return NextResponse.json({
      error: 'Validation failed',
      details: {
        errors: formattedErrors,
        message: 'Please check the provided data and try again'
      }
    }, { status: 400 })
  }

  static async withValidation<TBody = any, TQuery = any>(
    request: NextRequest,
    options: {
      bodySchema?: z.ZodSchema<TBody>
      querySchema?: z.ZodSchema<TQuery>
    },
    handler: (data: {
      body?: TBody
      query?: TQuery
    }) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const result: { body?: TBody; query?: TQuery } = {}

      // Validate body if schema provided and method requires body
      if (options.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const bodyValidation = await ValidationMiddleware.validateBody(request, options.bodySchema)
        
        if (!bodyValidation.success) {
          return ValidationMiddleware.createValidationErrorResponse(bodyValidation.errors!)
        }
        
        result.body = bodyValidation.data
      }

      // Validate query parameters if schema provided
      if (options.querySchema) {
        const queryValidation = await ValidationMiddleware.validateQuery(request, options.querySchema)
        
        if (!queryValidation.success) {
          return ValidationMiddleware.createValidationErrorResponse(queryValidation.errors!)
        }
        
        result.query = queryValidation.data
      }

      return await handler(result)
    } catch (error: any) {
      console.error('Validation middleware error:', error)
      return NextResponse.json({
        error: 'Validation error',
        details: error.message
      }, { status: 500 })
    }
  }
}