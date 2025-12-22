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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createRouteClient()
    const { id } = params

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { status } = await request.json()

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update report status
    const { data: report, error } = await supabase
      .from('reports')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
        updated_at,
        user:users (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error updating report status:', error)
      return NextResponse.json(
        { error: 'Failed to update report status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error updating report status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}