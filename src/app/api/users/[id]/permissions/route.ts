import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth-dynamic'
import { getUserPermissions } from '@/lib/dynamic-permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params
    
    // Users can only get their own permissions unless they're admin/superadmin
    if (user.id !== id && !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const permissions = await getUserPermissions(user)
    
    return NextResponse.json({
      permissions: permissions.map(p => ({
        resource: p.resource,
        action: p.action
      }))
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
    console.error('User permissions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch user permissions' }, { status: 500 })
  }
}