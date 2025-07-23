import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LeadStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as LeadStatus | null
    
    const leads = await prisma.lead.findMany({
      where: status ? { status } : undefined,
      include: {
        activities: true,
        customer: true,
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
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company, source, notes } = body
    
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        source,
        notes,
      },
      include: {
        activities: true,
        customer: true,
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
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
  }
}