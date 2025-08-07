import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LeadStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        activities: true,
        customer: true,
      },
    })
    
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    
    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { name, email, phone, company, status, source, notes } = body
    
    // Use a transaction to ensure both lead update and customer creation happen atomically
    const result = await prisma.$transaction(async (tx) => {
      // Update the lead
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          company,
          status: status as LeadStatus,
          source,
          notes,
          ...(status === 'CONVERTED' && { convertedAt: new Date() }),
        },
      })

      // If converting to customer and no customer exists yet, create one
      if (status === 'CONVERTED') {
        const existingCustomer = await tx.customer.findUnique({
          where: { leadId: id },
        })

        if (!existingCustomer) {
          await tx.customer.create({
            data: {
              name: updatedLead.name,
              email: updatedLead.email || `lead-${id}@converted.local`, // Email is required for customer
              phone: updatedLead.phone,
              company: updatedLead.company,
              notes: updatedLead.notes,
              leadId: id,
            },
          })
        }
      }

      // Return the updated lead with relationships
      return await tx.lead.findUnique({
        where: { id },
        include: {
          activities: true,
          customer: true,
        },
      })
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to update lead:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.lead.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: 'Lead deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}