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
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      )
    }


    // Check if user exists in our users table, create if not
    const { error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist, create them
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
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        )
      }
    } else if (userCheckError) {
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      )
    }

    const { title, description, reportType, location, locationType, imageUrl } = await request.json()

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
    const validReportTypes = ['SUPPORT', 'COMPLAINT', 'SUGGESTION']
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      )
    }

    // Validate location type  
    const validLocationTypes = ['PARK_RECREATION', 'SPORTS_VENUE', 'NATURE_PARK', 'CULTURAL_EVENT', 'MARKET_STREET', 'INSTITUTION']
    if (!validLocationTypes.includes(locationType)) {
      return NextResponse.json(
        { error: 'Invalid location type' },
        { status: 400 }
      )
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
        image_url: imageUrl || null,
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
        return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}