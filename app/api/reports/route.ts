import { NextRequest, NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const supabase = await createRouteClient()
    
    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        id,
        title,
        description,
        report_type,
        location,
        location_type,
        image_url,
        status,
        created_at,
        user:users (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      )
    }

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.log('No user found in session')
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      )
    }

    console.log('Authenticated user:', user.id, user.email)

    // Check if user exists in our users table, create if not
    const { error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist, create them
      console.log('Creating user record for:', user.email)
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'USER',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (createUserError) {
        console.error('Error creating user:', createUserError)
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        )
      }
    } else if (userCheckError) {
      console.error('Error checking user:', userCheckError)
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      )
    }

    const { title, description, reportType, location, locationType, imageUrl, mediaUrl, mediaType } = await request.json()

    // Input validation and sanitization
    if (!title || !reportType || !location || !locationType) {
      return NextResponse.json(
        { error: 'Title, report type, location, and location type are required' },
        { status: 400 }
      )
    }

    // Security: Validate input lengths and content
    if (typeof title !== 'string' || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be a string with maximum 200 characters' },
        { status: 400 }
      )
    }

    if (description && (typeof description !== 'string' || description.length > 2000)) {
      return NextResponse.json(
        { error: 'Description must be a string with maximum 2000 characters' },
        { status: 400 }
      )
    }

    // Validate report type
    const validReportTypes = ['SAFETY', 'MAINTENANCE', 'CLEANLINESS', 'ACCESSIBILITY', 'OTHER']
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      )
    }

    // Validate location type  
    const validLocationTypes = ['PARK', 'PLAYGROUND', 'WALKWAY', 'BUILDING', 'OTHER']
    if (!validLocationTypes.includes(locationType)) {
      return NextResponse.json(
        { error: 'Invalid location type' },
        { status: 400 }
      )
    }

    // Validate and sanitize media URL if provided
    let sanitizedMediaUrl = null
    if (mediaUrl) {
      if (typeof mediaUrl !== 'string' || mediaUrl.length > 500) {
        return NextResponse.json(
          { error: 'Media URL must be a string with maximum 500 characters' },
          { status: 400 }
        )
      }
      
      try {
        const urlObj = new URL(mediaUrl)
        // Allow both video and image URLs
        const allowedDomains = [
          'youtube.com', 'www.youtube.com', 'youtu.be',
          'vimeo.com', 'www.vimeo.com',
          'facebook.com', 'www.facebook.com', 'fb.watch',
          'drive.google.com', 'docs.google.com',
          // Image hosting
          'imgur.com', 'i.imgur.com',
          'images.unsplash.com', 'unsplash.com'
        ]
        
        const isAllowedDomain = allowedDomains.some(domain => 
          urlObj.hostname.toLowerCase() === domain || 
          urlObj.hostname.toLowerCase().endsWith(`.${domain}`)
        )
        
        if (!isAllowedDomain) {
          return NextResponse.json(
            { error: 'Media URL must be from allowed platforms (YouTube, Vimeo, Facebook, Google Drive, Imgur, Unsplash)' },
            { status: 400 }
          )
        }
        
        if (urlObj.protocol !== 'https:') {
          return NextResponse.json(
            { error: 'Media URL must use HTTPS protocol' },
            { status: 400 }
          )
        }
        
        sanitizedMediaUrl = mediaUrl.trim()
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid media URL format' },
          { status: 400 }
        )
      }
    }

    // Sanitize strings
    const sanitizedTitle = title.trim().substring(0, 200)
    const sanitizedDescription = description ? description.trim().substring(0, 2000) : null
    const sanitizedLocation = location.trim().substring(0, 500)

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        title: sanitizedTitle,
        description: sanitizedDescription,
        report_type: reportType,
        location: sanitizedLocation,
        location_type: locationType,
        image_url: imageUrl || sanitizedMediaUrl || null,
        user_id: user.id
      })
      .select(`
        id,
        title,
        description,
        report_type,
        location,
        location_type,
        image_url,
        status,
        created_at,
        user:users (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error creating report:', error)
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      )
    }

    return NextResponse.json({ report }, { 
      status: 201,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
      }
    })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}