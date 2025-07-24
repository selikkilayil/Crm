import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, getDataFilter } from '@/lib/api-auth'
import { PERMISSIONS, hasPermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check permissions
    const canViewAll = hasPermission(user.role, PERMISSIONS.CUSTOMERS_VIEW_ALL)
    const canViewAssigned = hasPermission(user.role, PERMISSIONS.CUSTOMERS_VIEW_ASSIGNED)
    
    if (!canViewAll && !canViewAssigned) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    // Build where clause based on permissions
    let whereClause: any = {}
    
    // Apply role-based data filtering if user can only view assigned
    if (!canViewAll && canViewAssigned) {
      const dataFilter = getDataFilter(user.role, user.id)
      whereClause = { ...whereClause, ...dataFilter }
    }
    
    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        activities: true,
        lead: true,
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(customers)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, billingAddress, gstin, leadId } = body
    
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        company,
        billingAddress,
        gstin,
        leadId,
      },
      include: {
        activities: true,
        lead: true,
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    })
    
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { 
          status: 'CONVERTED',
          convertedAt: new Date(),
        },
      })
    }
    
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}