import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, GIF, WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 10MB allowed.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.type.split('/')[1]
    const fileName = `${randomUUID()}.${fileExtension}`

    // Initialize Supabase client
    const supabase = createClient()

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase
      .storage
      .from('uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload to storage: ' + uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('uploads')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: file.size
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}