import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TaskStatus, TaskPriority } from '@prisma/client'
import { requireAuth, hasPermission, getDataFilter } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check permissions
    const canViewAll = hasPermission(user, 'tasks_view_all')
    const canViewAssigned = hasPermission(user, 'tasks_view_assigned')
    
    if (!canViewAll && !canViewAssigned) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as TaskStatus | null
    const priority = searchParams.get('priority') as TaskPriority | null
    const assignedToId = searchParams.get('assignedToId')
    const leadId = searchParams.get('leadId')
    const customerId = searchParams.get('customerId')
    
    // Build where clause
    let whereClause: any = {}
    
    // Add filters
    if (status) whereClause.status = status
    if (priority) whereClause.priority = priority
    if (assignedToId) whereClause.assignedToId = assignedToId
    if (leadId) whereClause.leadId = leadId
    if (customerId) whereClause.customerId = customerId
    
    // Apply role-based data filtering if user can only view assigned
    if (!canViewAll && canViewAssigned) {
      const dataFilter = getDataFilter(user.role, user.id)
      whereClause = { ...whereClause, ...dataFilter }
    }
    
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })
    
    return NextResponse.json(tasks)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    if (!hasPermission(user, 'tasks_create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const body = await request.json()
    const { 
      title, 
      description, 
      status, 
      priority, 
      dueDate, 
      assignedToId, 
      createdById,
      leadId,
      customerId 
    } = body
    
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status as TaskStatus,
        priority: priority as TaskPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId,
        createdById,
        leadId,
        customerId,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          },
        },
      },
    })
    
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}