import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LeadStatus } from '@prisma/client'
import { requireAuth, hasPermission, getDataFilter } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check if user has permission to view leads
    const canViewAll = hasPermission(user, 'leads_view_all')
    const canViewAssigned = hasPermission(user, 'leads_view_assigned')
    
    if (!canViewAll && !canViewAssigned) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as LeadStatus | null
    
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
    
    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        activities: true,
        customer: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    
    return NextResponse.json(leads)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    if (!hasPermission(user.role, PERMISSIONS.LEADS_CREATE)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    const body = await request.json()
    const { name, email, phone, company, source, notes, assignedToId } = body
    
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        source,
        notes,
        assignedToId: assignedToId || user.id, // Default to creator if no assignee
      },
      include: {
        activities: true,
        customer: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    })
    
    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}