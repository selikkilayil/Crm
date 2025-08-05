import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/auth-server'
import { ActivityType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    // Require authentication and permission
    await requirePermission(request, 'ACTIVITIES_VIEW_ALL')
    
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')
    const customerId = searchParams.get('customerId')
    
    const activities = await prisma.activity.findMany({
      where: {
        ...(leadId && { leadId }),
        ...(customerId && { customerId }),
      },
      include: {
        lead: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(activities)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication and permission
    const user = await requirePermission(request, 'ACTIVITIES_CREATE')
    
    const body = await request.json()
    const { type, title, description, scheduledAt, leadId, customerId } = body
    
    const activity = await prisma.activity.create({
      data: {
        type: type as ActivityType,
        title,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        leadId,
        customerId,
      },
      include: {
        lead: true,
        customer: true,
      },
    })
    
    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}