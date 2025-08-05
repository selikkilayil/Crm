import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, hasPermission, getDataFilter } from '@/lib/auth-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await requireAuth(request)
    
    const canViewAll = hasPermission(user, 'customers_view_all')
    const canViewAssigned = hasPermission(user, 'customers_view_assigned')
    
    if (!canViewAll && !canViewAssigned) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    let whereClause: any = { id }
    
    // Apply role-based filtering through customer relationship
    if (!canViewAll && canViewAssigned) {
      const customerFilter = getDataFilter(user.role, user.id)
      whereClause.customer = customerFilter
    }

    const contact = await prisma.contact.findFirst({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            phone: true,
          }
        }
      }
    })
    
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }
    
    return NextResponse.json({ data: contact })
  } catch (error) {
    console.error('Error fetching contact:', error)
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await requireAuth(request)
    
    if (!hasPermission(user, 'customers_edit_all') && !hasPermission(user, 'customers_edit_assigned')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // First check if contact exists and user has access
    let whereClause: any = { id }
    
    if (!hasPermission(user, 'customers_edit_all')) {
      const customerFilter = getDataFilter(user.role, user.id)
      whereClause.customer = customerFilter
    }

    const existingContact = await prisma.contact.findFirst({
      where: whereClause,
      include: { customer: true }
    })
    
    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, email, phone, position, isPrimary } = body
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Contact name is required' }, { status: 400 })
    }
    
    // If this contact is being marked as primary, unset other primary contacts for this customer
    if (isPrimary && !existingContact.isPrimary) {
      await prisma.contact.updateMany({
        where: { 
          customerId: existingContact.customerId,
          isPrimary: true,
          id: { not: id }
        },
        data: { isPrimary: false }
      })
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        position,
        isPrimary: isPrimary || false,
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

    return NextResponse.json({ data: contact, message: 'Contact updated successfully' })
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await requireAuth(request)
    
    if (!hasPermission(user, 'customers_delete') && !hasPermission(user, 'customers_edit_all') && !hasPermission(user, 'customers_edit_assigned')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // First check if contact exists and user has access
    let whereClause: any = { id }
    
    if (!hasPermission(user, 'customers_edit_all') && !hasPermission(user, 'customers_delete')) {
      const customerFilter = getDataFilter(user.role, user.id)
      whereClause.customer = customerFilter
    }

    const existingContact = await prisma.contact.findFirst({
      where: whereClause
    })
    
    if (!existingContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    await prisma.contact.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 })
  }
}