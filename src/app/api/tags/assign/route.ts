import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tagId, leadIds = [], customerIds = [], action = 'assign' } = body
    
    if (!tagId) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 })
    }
    
    if (leadIds.length === 0 && customerIds.length === 0) {
      return NextResponse.json({ error: 'At least one lead or customer ID is required' }, { status: 400 })
    }
    
    const results = []
    
    // Handle lead assignments
    for (const leadId of leadIds) {
      if (action === 'assign') {
        const result = await prisma.lead.update({
          where: { id: leadId },
          data: {
            tags: {
              connect: { id: tagId },
            },
          },
          include: {
            tags: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        })
        results.push({ type: 'lead', id: leadId, data: result })
      } else if (action === 'remove') {
        const result = await prisma.lead.update({
          where: { id: leadId },
          data: {
            tags: {
              disconnect: { id: tagId },
            },
          },
          include: {
            tags: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        })
        results.push({ type: 'lead', id: leadId, data: result })
      }
    }
    
    // Handle customer assignments
    for (const customerId of customerIds) {
      if (action === 'assign') {
        const result = await prisma.customer.update({
          where: { id: customerId },
          data: {
            tags: {
              connect: { id: tagId },
            },
          },
          include: {
            tags: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        })
        results.push({ type: 'customer', id: customerId, data: result })
      } else if (action === 'remove') {
        const result = await prisma.customer.update({
          where: { id: customerId },
          data: {
            tags: {
              disconnect: { id: tagId },
            },
          },
          include: {
            tags: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        })
        results.push({ type: 'customer', id: customerId, data: result })
      }
    }
    
    return NextResponse.json({ 
      message: `Tags ${action}ed successfully`,
      results 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign tags' }, { status: 500 })
  }
}