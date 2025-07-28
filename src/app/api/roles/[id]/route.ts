import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/api-auth-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await requirePermission(request, { resource: 'roles', action: 'view' })
    
    const role = await prisma.customRole.findUnique({
      where: { id },
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
    
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }
    
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
    
    return NextResponse.json(formattedRole)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    console.error('Role fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await requirePermission(request, { resource: 'roles', action: 'edit' })
    
    const body = await request.json()
    const { name, description, permissionIds, isActive } = body
    
    // Get existing role
    const existingRole = await prisma.customRole.findUnique({
      where: { id }
    })
    
    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }
    
    if (existingRole.isSystem && (name !== existingRole.name)) {
      return NextResponse.json({ error: 'Cannot rename system roles' }, { status: 400 })
    }
    
    // Check if new name conflicts with existing roles (if name is being changed)
    if (name && name !== existingRole.name) {
      const nameConflict = await prisma.customRole.findUnique({
        where: { name }
      })
      
      if (nameConflict) {
        return NextResponse.json({ error: 'Role name already exists' }, { status: 400 })
      }
    }
    
    // Verify all permission IDs exist (if permissions are being updated)
    if (permissionIds && Array.isArray(permissionIds)) {
      const permissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } }
      })
      
      if (permissions.length !== permissionIds.length) {
        return NextResponse.json({ error: 'Some permissions are invalid' }, { status: 400 })
      }
    }
    
    // Update role
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive
    
    const role = await prisma.customRole.update({
      where: { id },
      data: updateData,
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
    
    // Update permissions if provided
    if (permissionIds && Array.isArray(permissionIds)) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      })
      
      // Add new permissions
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId: string) => ({
          roleId: id,
          permissionId
        }))
      })
      
      // Fetch updated role with new permissions
      const updatedRole = await prisma.customRole.findUnique({
        where: { id },
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
      
      if (updatedRole) {
        const formattedRole = {
          id: updatedRole.id,
          name: updatedRole.name,
          description: updatedRole.description,
          isSystem: updatedRole.isSystem,
          isActive: updatedRole.isActive,
          userCount: updatedRole._count.users,
          permissions: updatedRole.permissions.map(rp => ({
            id: rp.permission.id,
            resource: rp.permission.resource,
            action: rp.permission.action,
            description: rp.permission.description,
            category: rp.permission.category
          })),
          createdAt: updatedRole.createdAt,
          updatedAt: updatedRole.updatedAt
        }
        
        return NextResponse.json(formattedRole)
      }
    }
    
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
    
    return NextResponse.json(formattedRole)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    console.error('Role update error:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await requirePermission(request, { resource: 'roles', action: 'delete' })
    
    const role = await prisma.customRole.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true
          }
        }
      }
    })
    
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }
    
    if (role.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 400 })
    }
    
    if (role._count.users > 0) {
      return NextResponse.json({ 
        error: `Cannot delete role. ${role._count.users} user(s) are assigned to this role.` 
      }, { status: 400 })
    }
    
    await prisma.customRole.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    console.error('Role deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}