import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'
import bcrypt from 'bcrypt'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { currentPassword, newPassword } = body
    
    // Users can only change their own password, or admins can change anyone's
    if (user.id !== params.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 })
    }
    
    // Get the user from database
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        password: true,
        isActive: true,
      },
    })
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (!targetUser.isActive) {
      return NextResponse.json({ error: 'User account is inactive' }, { status: 403 })
    }
    
    // Verify current password if user is changing their own password
    if (user.id === params.id) {
      if (targetUser.password) {
        const isValidPassword = await bcrypt.compare(currentPassword, targetUser.password)
        if (!isValidPassword) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }
      } else {
        // For demo users without passwords, allow any current password
        // In production, you might want to handle this differently
      }
    }
    
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    
    // Update the password
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedNewPassword },
    })
    
    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
    }
    console.error('Password update error:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}