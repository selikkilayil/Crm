import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { requireAuth } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check permissions (only admins can upload logos)
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload PNG, JPEG, GIF, or WebP images only.' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Please upload an image smaller than 5MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filename = `logo-${timestamp}.${fileExtension}`
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's okay
    }

    // Save file
    const filePath = path.join(uploadsDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    
    // Return the public URL
    const logoUrl = `/uploads/logos/${filename}`
    
    return NextResponse.json({ 
      logoUrl,
      filename,
      size: file.size,
      type: file.type 
    })
    
  } catch (error: any) {
    console.error('Logo upload error:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to upload logo',
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE method to remove logo
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    // Check permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
    }

    // Remove file from filesystem
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'logos', filename)
    
    try {
      const { unlink } = await import('fs/promises')
      await unlink(filePath)
    } catch (error) {
      // File might not exist, that's okay
      console.log('Could not delete file (may not exist):', filename)
    }
    
    return NextResponse.json({ message: 'Logo deleted successfully' })
    
  } catch (error: any) {
    console.error('Logo delete error:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete logo',
      details: error.message 
    }, { status: 500 })
  }
}