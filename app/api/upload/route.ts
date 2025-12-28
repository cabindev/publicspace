import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const createRouteClient = async () => {
  const cookieStore = await cookies()
  
  // Get tokens from cookies
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: async (key: string) => {
            if (key === 'sb-access-token') return accessToken || null
            if (key === 'sb-refresh-token') return refreshToken || null
            return cookieStore.get(key)?.value ?? null
          },
          setItem: async (key: string, value: string) => {
            cookieStore.set(key, value)
          },
          removeItem: async (key: string) => {
            cookieStore.delete(key)
          },
        },
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
    }
  )
  
  // Set session if tokens exist
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })
  }
  
  return supabase
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createRouteClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Comprehensive file validation
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    
    // Check MIME type
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit - reduced for security)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    // Additional security: Check file signature/magic bytes
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileSignature = buffer.subarray(0, 4).toString('hex')
    
    const validSignatures = [
      'ffd8ff', // JPEG
      '89504e47', // PNG
      '47494638', // GIF
      '52494646' // WEBP (RIFF)
    ]
    
    const isValidSignature = validSignatures.some(sig => 
      fileSignature.toLowerCase().startsWith(sig.toLowerCase())
    )
    
    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid file format detected.' },
        { status: 400 }
      )
    }

    // Generate secure filename with proper extension
    const safeExtension = file.type === 'image/jpeg' ? '.jpg' :
                         file.type === 'image/png' ? '.png' :
                         file.type === 'image/gif' ? '.gif' :
                         file.type === 'image/webp' ? '.webp' : '.jpg'
    
    const fileName = `${randomUUID()}${safeExtension}`
    
    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'report')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Secure file path (prevent path traversal)
    const safePath = join(uploadDir, fileName.replace(/[^a-zA-Z0-9.-]/g, ''))
    
    // Double-check the file is within upload directory
    if (!safePath.startsWith(uploadDir)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }
    
    await writeFile(safePath, buffer)

    // Return the public URL
    const fileUrl = `/report/${fileName}`
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: fileName,
      size: file.size
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}