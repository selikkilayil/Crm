import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            leads: true,
            customers: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json(tags)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, color, description } = body
    
    if (!name || !color) {
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 })
    }
    
    const tag = await prisma.tag.create({
      data: {
        name,
        color,
        description,
      },
      include: {
        _count: {
          select: {
            leads: true,
            customers: true,
          },
        },
      },
    })
    
    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}