import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { getAuthenticatedUser } from '@/lib/api-auth-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get the current user to check their role
    const currentUser = await getAuthenticatedUser(request)
    
    // Build where clause - if user is not SUPERADMIN, exclude SUPERADMIN users
    const whereClause: any = {}
    if (currentUser?.role !== 'SUPERADMIN') {
      whereClause.role = { not: 'SUPERADMIN' }
    }
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedLeads: true,
            assignedTasks: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role, customRoleId, password } = body
    
    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Get the current user to check their role
    const currentUser = await getAuthenticatedUser(request)
    
    // Only SUPERADMIN users can create SUPERADMIN users
    if (role === 'SUPERADMIN' && currentUser?.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions to create SUPERADMIN user' }, { status: 403 })
    }
    
    // Validate custom role if provided
    if (customRoleId) {
      const customRole = await prisma.customRole.findUnique({
        where: { id: customRoleId, isActive: true }
      })
      
      if (!customRole) {
        return NextResponse.json({ error: 'Invalid custom role' }, { status: 400 })
      }
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        customRoleId: customRoleId || null,
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            assignedLeads: true,
            assignedTasks: true,
          },
        },
      },
    })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}