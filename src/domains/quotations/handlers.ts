import { NextRequest, NextResponse } from 'next/server'
import { QuotationService } from './services/QuotationService'
import { validateCreateQuotation, validateUpdateQuotation, validateQuotationFilters } from './validation'
import { requireAuth, requirePermission, hasPermission } from '@/lib/auth-server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import QuotationPDFTemplate from '@/components/pdf/QuotationPDFTemplate'

const quotationService = new QuotationService()

export class QuotationHandlers {
  static async getQuotations(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requirePermission(request, 'QUOTATIONS_VIEW_ALL')
      
      const { searchParams } = new URL(request.url)
      const filters = {
        status: searchParams.get('status') || undefined,
        customerId: searchParams.get('customerId') || undefined,
        search: searchParams.get('search') || undefined,
      }

      // Validate filters
      const validationResult = validateQuotationFilters(filters)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Invalid filters', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const quotations = await quotationService.getQuotations(validationResult.data)
      return NextResponse.json(quotations)
    } catch (error: any) {
      console.error('Error fetching quotations:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      
      if (error.message?.startsWith('Insufficient permissions')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 })
    }
  }

  static async createQuotation(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requirePermission(request, 'QUOTATIONS_CREATE')
      
      const body = await request.json()
      
      // Add createdById from authenticated user
      const quotationData = {
        ...body,
        createdById: user.id,
      }

      // Validate request data
      const validationResult = validateCreateQuotation(quotationData)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const quotation = await quotationService.createQuotation(validationResult.data)
      return NextResponse.json(quotation, { status: 201 })
    } catch (error: any) {
      console.error('Error creating quotation:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      
      if (error.message?.startsWith('Insufficient permissions')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 })
    }
  }

  static async getQuotationById(id: string, request?: NextRequest): Promise<NextResponse> {
    try {
      if (request) {
        await requireAuth(request)
        // Note: You might want to add permission check based on business requirements
      }

      const quotation = await quotationService.getQuotationById(id)
      return NextResponse.json(quotation)
    } catch (error: any) {
      console.error('Error fetching quotation:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      
      if (error.message === 'Quotation not found') {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 })
    }
  }

  static async updateQuotation(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      // Check permissions
      const canEditAll = hasPermission(user, 'QUOTATIONS_EDIT_ALL')
      const canEditOwn = hasPermission(user, 'QUOTATIONS_EDIT_OWN')
      
      if (!canEditAll && !canEditOwn) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const body = await request.json()
      
      // Validate request data
      const validationResult = validateUpdateQuotation(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const quotation = await quotationService.updateQuotation(id, validationResult.data)
      return NextResponse.json(quotation)
    } catch (error: any) {
      console.error('Error updating quotation:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      
      if (error.message?.startsWith('Insufficient permissions')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      if (error.message === 'Quotation not found') {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 })
    }
  }

  static async deleteQuotation(id: string, request?: NextRequest): Promise<NextResponse> {
    try {
      if (request) {
        const user = await requireAuth(request)
        
        const canDeleteAll = hasPermission(user, 'QUOTATIONS_DELETE_ALL')
        const canDeleteOwn = hasPermission(user, 'QUOTATIONS_DELETE_OWN')
        
        if (!canDeleteAll && !canDeleteOwn) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      await quotationService.deleteQuotation(id)
      return NextResponse.json({ message: 'Quotation deleted successfully' })
    } catch (error: any) {
      console.error('Error deleting quotation:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      
      if (error.message?.startsWith('Insufficient permissions')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      if (error.message === 'Quotation not found') {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 })
    }
  }

  static async duplicateQuotation(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requirePermission(request, 'QUOTATIONS_CREATE')
      
      const body = await request.json()
      const { createdById } = body

      // Use the authenticated user's ID if not provided
      const actualCreatedById = createdById || user.id

      const duplicatedQuotation = await quotationService.duplicateQuotation(id, actualCreatedById)
      return NextResponse.json(duplicatedQuotation, { status: 201 })
    } catch (error: any) {
      console.error('Error duplicating quotation:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      
      if (error.message?.startsWith('Insufficient permissions')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      if (error.message === 'Quotation not found') {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to duplicate quotation' }, { status: 500 })
    }
  }

  static async generateQuotationPDF(id: string, request?: NextRequest): Promise<NextResponse> {
    try {
      if (request) {
        await requireAuth(request)
        // Note: You might want to add permission check based on business requirements
      }

      // Fetch quotation with all related data
      const quotation = await quotationService.getQuotationForPDF(id)
      
      // Fetch PDF settings
      const settings = await quotationService.getPDFSettings()

      // Convert Prisma Decimal objects to numbers for React PDF
      const processedQuotation = quotationService.processQuotationForPDF(quotation)
      const processedSettings = quotationService.processPDFSettings(settings)

      // Generate PDF using React PDF template with settings
      const pdfBuffer = await renderToBuffer(React.createElement(QuotationPDFTemplate, { 
        quotation: processedQuotation, 
        settings: processedSettings 
      }))

      // Return PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="quotation-${quotation.quotationNumber}.pdf"`,
        },
      })
    } catch (error: any) {
      console.error('Error generating PDF:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      
      if (error.message === 'Quotation not found') {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
    }
  }
}