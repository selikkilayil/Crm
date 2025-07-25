import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/api-auth-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requirePermission(request, { resource: 'roles', action: 'view' })
    
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: 'asc' },
        { resource: 'asc' },
        { action: 'asc' }
      ]
    })
    
    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const category = permission.category || 'Other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(permission)
      return acc
    }, {} as Record<string, typeof permissions>)
    
    return NextResponse.json({
      permissions,
      groupedPermissions
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }
    console.error('Permissions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 })
  }
}