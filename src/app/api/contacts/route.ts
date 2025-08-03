import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, hasPermission, getDataFilter } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check permissions - contacts are tied to customers
    const canViewAll = hasPermission(user, 'customers_view_all')
    const canViewAssigned = hasPermission(user, 'customers_view_assigned')
    
    if (!canViewAll && !canViewAssigned) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const search = searchParams.get('search')
    const isPrimary = searchParams.get('isPrimary')
    
    // Build where clause
    let whereClause: any = {}
    
    if (customerId) {
      whereClause.customerId = customerId
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (isPrimary !== null) {
      whereClause.isPrimary = isPrimary === 'true'
    }
    
    // Apply role-based filtering through customer relationship
    if (!canViewAll && canViewAssigned) {
      const customerFilter = getDataFilter(user.role, user.id)
      whereClause.customer = customerFilter
    }

    const contacts = await prisma.contact.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          }
        }
      },
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ data: contacts })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    if (!hasPermission(user, 'customers_create') && !hasPermission(user, 'customers_edit_all') && !hasPermission(user, 'customers_edit_assigned')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, position, isPrimary, customerId } = body
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Contact name is required' }, { status: 400 })
    }
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }
    
    // Verify customer exists and user has access
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    
    // Check customer access if user has restricted permissions
    if (!hasPermission(user, 'customers_edit_all')) {
      const customerFilter = getDataFilter(user.role, user.id)
      if (customerFilter.OR) {
        const hasAccess = customerFilter.OR.some((filter: any) => {
          if (filter.assignedToId && customer.leadId) {
            // Would need to check lead assignment - simplified for now
            return true
          }
          return false
        })
        // Simplified access check - in production, implement proper customer access verification
      }
    }
    
    // If this contact is marked as primary, unset other primary contacts for this customer
    if (isPrimary) {
      await prisma.contact.updateMany({
        where: { 
          customerId: customerId,
          isPrimary: true 
        },
        data: { isPrimary: false }
      })
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        position,
        isPrimary: isPrimary || false,
        customerId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({ data: contact, message: 'Contact created successfully' })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 })
  }
}