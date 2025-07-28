import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        leads: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            status: true,
          },
        },
        customers: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        _count: {
          select: {
            leads: true,
            customers: true,
          },
        },
      },
    })
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }
    
    return NextResponse.json(tag)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { name, color, description } = body
    
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (color !== undefined) updateData.color = color
    if (description !== undefined) updateData.description = description
    
    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            leads: true,
            customers: true,
          },
        },
      },
    })
    
    return NextResponse.json(tag)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.tag.delete({
      where: { id },
    })
    
    return NextResponse.json({ message: 'Tag deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}