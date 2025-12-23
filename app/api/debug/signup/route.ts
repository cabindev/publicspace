import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    console.log('=== DEBUG SIGNUP START ===')
    console.log('Email:', email)
    console.log('Name:', name)
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Has NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test signup
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: undefined
      }
    })

    console.log('Signup success:', !!signupData.user)
    console.log('Signup error:', signupError?.message)
    console.log('User ID:', signupData.user?.id)
    console.log('Email confirmed:', signupData.user?.email_confirmed_at)
    console.log('Session created:', !!signupData.session)

    if (signupError) {
      return NextResponse.json({ 
        success: false, 
        error: signupError.message,
        debug: 'Signup failed'
      })
    }

    // Test database insert (if user was created)
    let dbResult = null
    if (signupData.user) {
      const { data: insertData, error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: signupData.user.id,
            email: signupData.user.email,
            name: name,
            role: 'USER',
            status: 'PENDING'
          }
        ])
        .select()

      console.log('DB insert success:', !!insertData)
      console.log('DB error:', dbError?.message)
      
      dbResult = {
        success: !!insertData,
        error: dbError?.message || null,
        data: insertData
      }
    }

    // Test if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    const userExists = authUsers?.users?.some(u => u.email === email)
    
    console.log('User exists in auth.users:', userExists)
    console.log('Auth admin error:', authError?.message)

    console.log('=== DEBUG SIGNUP END ===')

    return NextResponse.json({ 
      success: !!signupData.user,
      userCreated: !!signupData.user,
      userID: signupData.user?.id,
      emailConfirmed: signupData.user?.email_confirmed_at,
      sessionCreated: !!signupData.session,
      dbResult,
      userExistsInAuth: userExists
    })

  } catch (error) {
    console.error('Debug signup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}