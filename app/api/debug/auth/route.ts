import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('=== DEBUG AUTH START ===')
    console.log('Email:', email)
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Has SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('Has NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Auth success:', !!authData.user)
    console.log('Auth error:', authError?.message)

    if (authError) {
      return NextResponse.json({ 
        success: false, 
        error: authError.message,
        debug: 'Auth failed'
      })
    }

    // Test database connection
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    console.log('DB query success:', !!users)
    console.log('DB error:', dbError?.message)
    console.log('User found in DB:', !!users?.[0])

    // Test auth user data
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('Get user success:', !!user)
    console.log('Get user error:', userError?.message)

    console.log('=== DEBUG AUTH END ===')

    return NextResponse.json({ 
      success: true,
      authUser: !!authData.user,
      dbUser: users?.[0] || null,
      dbError: dbError?.message || null,
      currentUser: user?.email || null
    })

  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}