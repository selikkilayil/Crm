import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAccessToken } from '@/lib/auth-server'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('Invalid JSON in request body:', jsonError)
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Email and password must be strings' }, { status: 400 })
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        customRoleId: true,
        customRole: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        password: true,
        isActive: true,
      },
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 401 })
    }
    
    // Require password - no demo mode bypass
    if (!user.password) {
      return NextResponse.json({ error: 'Account setup incomplete. Please contact administrator.' }, { status: 401 })
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    
    // Generate JWT token
    const { password: _, ...userForToken } = user
    const token = generateAccessToken(userForToken)
    
    // Create secure response with HTTP-only cookie
    const response = NextResponse.json({
      user: userForToken,
      message: 'Login successful'
    })
    
    // Set HTTP-only cookie for secure token storage
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('database')) {
        return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
      }
      
      if (error.message.includes('JWT') || error.message.includes('token')) {
        return NextResponse.json({ error: 'Authentication system error' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ error: 'Login failed - please try again' }, { status: 500 })
  }
}