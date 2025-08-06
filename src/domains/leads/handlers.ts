import { NextRequest, NextResponse } from 'next/server'
import { LeadService } from './services/LeadService'
import { validateLead, validateLeadUpdate } from './validation'
import { requireAuth, getDataFilter, hasPermission } from '@/lib/auth-server'

const leadService = new LeadService()

export class LeadHandlers {
  static async getLeads(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      // Check if user has permission to view leads
      const canViewAll = hasPermission(user, 'LEADS_VIEW_ALL')
      const canViewAssigned = hasPermission(user, 'LEADS_VIEW_ASSIGNED')
      
      if (!canViewAll && !canViewAssigned) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status')
      
      // Build where clause based on user role and permissions
      let whereClause: any = {}
      
      // Add status filter if provided
      if (status) {
        whereClause.status = status
      }
      
      // Apply role-based data filtering if user can only view assigned
      if (!canViewAll && canViewAssigned) {
        const dataFilter = getDataFilter(user.role, user.id)
        whereClause = { ...whereClause, ...dataFilter }
      }
      
      const leads = await leadService.getLeads(whereClause)
      return NextResponse.json(leads)
    } catch (error: any) {
      console.error('Get leads error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }
  }

  static async createLead(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      if (!hasPermission(user, 'LEADS_CREATE')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      const body = await request.json()
      
      // Validate request data
      const validationResult = validateLead(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const leadData = {
        ...validationResult.data,
        assignedToId: validationResult.data.assignedToId || user.id, // Default to creator
      }
      
      const lead = await leadService.createLead(leadData)
      return NextResponse.json(lead, { status: 201 })
    } catch (error: any) {
      console.error('Lead creation error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }
  }

  static async getLeadById(id: string): Promise<NextResponse> {
    try {
      const lead = await leadService.getLeadById(id)
      
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }
      
      return NextResponse.json(lead)
    } catch (error) {
      console.error('Get lead error:', error)
      return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
    }
  }

  static async updateLead(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      
      // Validate request data
      const validationResult = validateLeadUpdate(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const lead = await leadService.updateLead(id, validationResult.data)
      return NextResponse.json(lead)
    } catch (error: any) {
      console.error('Lead update error:', error)
      
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }
  }

  static async deleteLead(id: string): Promise<NextResponse> {
    try {
      await leadService.deleteLead(id)
      return NextResponse.json({ message: 'Lead deleted successfully' })
    } catch (error: any) {
      console.error('Lead deletion error:', error)
      
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
    }
  }
}