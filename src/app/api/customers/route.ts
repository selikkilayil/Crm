import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
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