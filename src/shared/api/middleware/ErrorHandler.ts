import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: any
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: any

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class ConflictError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} already exists`, 409, 'CONFLICT')
  }
}

export class ErrorHandler {
  static handle(error: unknown): NextResponse {
    console.error('API Error:', error)

    // Handle custom app errors
    if (error instanceof AppError) {
      return NextResponse.json({
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: error.statusCode })
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return ErrorHandler.handlePrismaError(error)
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 })
    }

    // Handle generic errors
    if (error instanceof Error) {
      // In development, show the actual error message
      const message = process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error'

      return NextResponse.json({
        error: message,
        code: 'INTERNAL_ERROR'
      }, { status: 500 })
    }

    // Fallback for unknown error types
    return NextResponse.json({
      error: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR'
    }, { status: 500 })
  }

  private static handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
    switch (error.code) {
      case 'P2000':
        return NextResponse.json({
          error: 'Value too long for field',
          code: 'VALUE_TOO_LONG',
          details: error.meta
        }, { status: 400 })

      case 'P2001':
        return NextResponse.json({
          error: 'Record not found',
          code: 'NOT_FOUND',
          details: error.meta
        }, { status: 404 })

      case 'P2002':
        const field = Array.isArray(error.meta?.target) 
          ? (error.meta.target as string[]).join(', ')
          : 'field'
        return NextResponse.json({
          error: `${field} already exists`,
          code: 'UNIQUE_CONSTRAINT',
          details: error.meta
        }, { status: 409 })

      case 'P2003':
        return NextResponse.json({
          error: 'Foreign key constraint violation',
          code: 'FOREIGN_KEY_CONSTRAINT',
          details: error.meta
        }, { status: 400 })

      case 'P2004':
        return NextResponse.json({
          error: 'Database constraint violation',
          code: 'CONSTRAINT_VIOLATION',
          details: error.meta
        }, { status: 400 })

      case 'P2025':
        return NextResponse.json({
          error: 'Record to update not found',
          code: 'UPDATE_NOT_FOUND',
          details: error.meta
        }, { status: 404 })

      default:
        return NextResponse.json({
          error: 'Database error',
          code: 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.meta : undefined
        }, { status: 500 })
    }
  }

  static async withErrorHandling<T>(
    handler: () => Promise<T>
  ): Promise<NextResponse | T> {
    try {
      return await handler()
    } catch (error) {
      return ErrorHandler.handle(error)
    }
  }

  static createApiError(
    message: string, 
    statusCode: number = 500, 
    code: string = 'API_ERROR',
    details?: any
  ): AppError {
    return new AppError(message, statusCode, code, details)
  }
}