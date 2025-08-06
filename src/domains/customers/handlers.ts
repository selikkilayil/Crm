import { NextRequest, NextResponse } from 'next/server'
import { CustomerService } from './services/CustomerService'
import { validateCustomer, validateCustomerUpdate } from './validation'
import { requireAuth, getDataFilter, hasPermission } from '@/lib/auth-server'

const customerService = new CustomerService()

export class CustomerHandlers {
  static async getCustomers(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      // Check if user has permission to view customers
      const canViewAll = hasPermission(user, 'CUSTOMERS_VIEW_ALL')
      const canViewAssigned = hasPermission(user, 'CUSTOMERS_VIEW_ASSIGNED')
      
      if (!canViewAll && !canViewAssigned) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const { searchParams } = new URL(request.url)
      const search = searchParams.get('search')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = Math.min(100, parseInt(searchParams.get('limit') || '10'))
      
      // Build where clause based on user role and permissions
      let whereClause: any = {}
      
      // Apply role-based data filtering if user can only view assigned
      if (!canViewAll && canViewAssigned) {
        const dataFilter = getDataFilter(user.role, user.id)
        whereClause = { ...whereClause, ...dataFilter }
      }
      
      const customers = await customerService.getCustomers({ search, page, limit, where: whereClause })
      return NextResponse.json(customers)
    } catch (error: any) {
      console.error('Get customers error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
    }
  }

  static async createCustomer(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      if (!hasPermission(user, 'CUSTOMERS_CREATE')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const body = await request.json()
      
      // Validate request data
      const validationResult = validateCustomer(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const customerData = {
        ...validationResult.data,
        createdById: user.id,
      }

      const customer = await customerService.createCustomer(customerData)
      return NextResponse.json(customer, { status: 201 })
    } catch (error: any) {
      console.error('Customer creation error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message?.includes('already exists')) {
        return NextResponse.json({ error: 'Customer with this email already exists' }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }
  }

  static async getCustomerById(id: string, request?: NextRequest): Promise<NextResponse> {
    try {
      if (request) {
        const user = await requireAuth(request)
        
        const canViewAll = hasPermission(user, 'CUSTOMERS_VIEW_ALL')
        const canViewAssigned = hasPermission(user, 'CUSTOMERS_VIEW_ASSIGNED')
        
        if (!canViewAll && !canViewAssigned) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      const customer = await customerService.getCustomerById(id)
      
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      
      return NextResponse.json(customer)
    } catch (error: any) {
      console.error('Get customer error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
    }
  }

  static async updateCustomer(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      const canEditAll = hasPermission(user, 'CUSTOMERS_EDIT_ALL')
      const canEditAssigned = hasPermission(user, 'CUSTOMERS_EDIT_ASSIGNED')
      
      if (!canEditAll && !canEditAssigned) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      const body = await request.json()
      
      // Validate request data
      const validationResult = validateCustomerUpdate(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const customer = await customerService.updateCustomer(id, validationResult.data)
      return NextResponse.json(customer)
    } catch (error: any) {
      console.error('Customer update error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      if (error.message?.includes('already in use')) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
    }
  }

  static async deleteCustomer(id: string, request?: NextRequest): Promise<NextResponse> {
    try {
      if (request) {
        const user = await requireAuth(request)
        
        if (!hasPermission(user, 'CUSTOMERS_DELETE')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      await customerService.deleteCustomer(id)
      return NextResponse.json({ message: 'Customer deleted successfully' })
    } catch (error: any) {
      console.error('Customer deletion error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
    }
  }
}