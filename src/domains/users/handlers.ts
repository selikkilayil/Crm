import { NextRequest, NextResponse } from 'next/server'
import { UserService } from './services/UserService'
import { validateUser, validateUserUpdate } from './validation'
import { getAuthenticatedUser } from '@/lib/api-auth-dynamic'

const userService = new UserService()

export class UserHandlers {
  static async getUsers(request: NextRequest): Promise<NextResponse> {
    try {
      // Get the current user to check their role
      const currentUser = await getAuthenticatedUser(request)
      
      // Build where clause - if user is not SUPERADMIN, exclude SUPERADMIN users
      const whereClause: any = {}
      if (currentUser?.role !== 'SUPERADMIN') {
        whereClause.role = { not: 'SUPERADMIN' }
      }
      
      const users = await userService.getUsers(whereClause)
      return NextResponse.json(users)
    } catch (error) {
      console.error('Get users error:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
  }

  static async createUser(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      
      // Validate request data
      const validationResult = validateUser(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const { name, email, role, customRoleId, password } = validationResult.data
      
      // Get the current user to check their role
      const currentUser = await getAuthenticatedUser(request)
      
      // Only SUPERADMIN users can create SUPERADMIN users
      if (role === 'SUPERADMIN' && currentUser?.role !== 'SUPERADMIN') {
        return NextResponse.json({ 
          error: 'Insufficient permissions to create SUPERADMIN user' 
        }, { status: 403 })
      }
      
      const user = await userService.createUser({
        name,
        email,
        role,
        customRoleId,
        password
      })
      
      return NextResponse.json(user, { status: 201 })
    } catch (error: any) {
      console.error('User creation error:', error)
      
      if (error.message?.includes('already exists')) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
  }

  static async getUserById(id: string): Promise<NextResponse> {
    try {
      const user = await userService.getUserById(id)
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json(user)
    } catch (error) {
      console.error('Get user error:', error)
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }
  }

  static async updateUser(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      
      // Validate request data
      const validationResult = validateUserUpdate(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const user = await userService.updateUser(id, validationResult.data)
      return NextResponse.json(user)
    } catch (error: any) {
      console.error('User update error:', error)
      
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      if (error.message?.includes('already in use')) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
  }

  static async deleteUser(id: string): Promise<NextResponse> {
    try {
      await userService.deleteUser(id)
      return NextResponse.json({ message: 'User deactivated successfully' })
    } catch (error: any) {
      console.error('User deletion error:', error)
      
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
  }

  static async updatePassword(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const { password } = body
      
      if (!password || password.length < 6) {
        return NextResponse.json({ 
          error: 'Password must be at least 6 characters' 
        }, { status: 400 })
      }
      
      await userService.updatePassword(id, password)
      return NextResponse.json({ message: 'Password updated successfully' })
    } catch (error: any) {
      console.error('Password update error:', error)
      
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }
  }
}