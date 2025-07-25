import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/api-auth-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, { resource: 'roles', action: 'view' })
    
    const roles = await prisma.customRole.findMany({
      where: { isActive: true },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: [
        { isSystem: 'desc' }, // System roles first
        { name: 'asc' }
      ]
    })
    
    // Format the response
    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      isActive: role.isActive,
      userCount: role._count.users,
      permissions: role.permissions.map(rp => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description,
        category: rp.permission.category
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }))
    
    return NextResponse.json(formattedRoles)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    console.error('Roles fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission(request, { resource: 'roles', action: 'create' })
    
    const body = await request.json()
    const { name, description, permissionIds } = body
    
    if (!name || !Array.isArray(permissionIds)) {
      return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 })
    }
    
    // Check if role name already exists
    const existingRole = await prisma.customRole.findUnique({
      where: { name }
    })
    
    if (existingRole) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 })
    }
    
    // Verify all permission IDs exist
    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } }
    })
    
    if (permissions.length !== permissionIds.length) {
      return NextResponse.json({ error: 'Some permissions are invalid' }, { status: 400 })
    }
    
    // Create role with permissions
    const role = await prisma.customRole.create({
      data: {
        name,
        description,
        isSystem: false,
        permissions: {
          create: permissionIds.map((permissionId: string) => ({
            permissionId
          }))
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            users: true
          }
        }
      }
    })
    
    // Format response
    const formattedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      isActive: role.isActive,
      userCount: role._count.users,
      permissions: role.permissions.map(rp => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description,
        category: rp.permission.category
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }
    
    return NextResponse.json(formattedRole, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    console.error('Role creation error:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}