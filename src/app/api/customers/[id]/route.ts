import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        contacts: true,
        tags: true,
        lead: true,
      },
    })
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      phone, 
      company, 
      billingAddress, 
      shippingAddress,
      gstin, 
      notes,
      isArchived 
    } = body
    
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        company,
        billingAddress,
        shippingAddress,
        gstin,
        notes,
        isArchived,
      },
      include: {
        activities: true,
        tasks: true,
        contacts: true,
        tags: true,
        lead: true,
      },
    })
    
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.customer.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}