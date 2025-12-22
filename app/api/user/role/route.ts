import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if user exists in our users table
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, status')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    if (user) {
      return NextResponse.json({ 
        role: user.role,
        status: user.status,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status
        }
      })
    }

    // User not found in database, return default role and status
    return NextResponse.json({ 
      role: 'USER',
      status: 'PENDING',
      user: null
    })

  } catch (error) {
    console.error('Error checking user role:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}