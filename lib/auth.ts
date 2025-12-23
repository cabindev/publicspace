import { createClient } from './supabase/client'

export interface User {
  id: string
  email: string
  name?: string
  role?: 'USER' | 'ADMIN' | 'MODERATOR'
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ACTIVE'
}

export async function signInWithGoogle(): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('Google sign-in error:', error.message)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Google sign-in catch error:', error)
    return { error: 'Google sign-in failed' }
  }
}

export async function signIn(email: string, password: string): Promise<{ user?: User; error?: string }> {
  try {
    const supabase = createClient()

    console.log('Attempting login for:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase auth error:', error.message)
      return { error: error.message }
    }

    if (data.user) {
      // Get user role from database
      let roleData = { role: 'USER', status: 'PENDING' }
      try {
        console.log('Fetching role for user:', data.user.email)
        const roleResponse = await fetch('/api/user/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.user.email })
        })

        if (roleResponse.ok) {
          const response = await roleResponse.json()
          console.log('Role response:', response)
          roleData = {
            role: (response.role || 'USER') as 'USER' | 'ADMIN' | 'MODERATOR',
            status: (response.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ACTIVE'
          }
        } else {
          console.error('Role API error:', roleResponse.status, await roleResponse.text())
        }
      } catch (roleError) {
        console.error('Error fetching role:', roleError)
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.full_name || 'User',
        role: roleData.role as 'USER' | 'ADMIN' | 'MODERATOR',
        status: roleData.status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'SUSPENDED'
      }

      // Store minimal user data in localStorage for UI
      localStorage.setItem('user', JSON.stringify(user))

      // Set session cookie for API routes
      document.cookie = `sb-access-token=${data.session?.access_token || ''}; Path=/; SameSite=Lax`
      document.cookie = `sb-refresh-token=${data.session?.refresh_token || ''}; Path=/; SameSite=Lax`

      window.dispatchEvent(new Event('userUpdate'))

      return { user }
    }

    return { error: 'Login failed' }
  } catch (error) {
    console.error('Sign in error:', error)
    return { error: 'Login failed' }
  }
}

export async function signUp(email: string, password: string, fullName: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = createClient()

    console.log('Attempting signup for:', email, 'with name:', fullName)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: undefined
      }
    })

    if (error) {
      console.error('Supabase signup error:', error.message)
      return { error: error.message }
    }

    console.log('Signup result - User created:', !!data.user)
    console.log('Signup result - Session:', !!data.session)
    console.log('Signup result - User ID:', data.user?.id)
    console.log('Signup result - Email confirmed:', data.user?.email_confirmed_at)

    if (data.user) {
      // Create user record in database
      try {
        console.log('Creating user record in database...')
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: fullName,
              role: 'USER',
              status: 'PENDING'
            }
          ])

        if (dbError) {
          console.error('Database insert error:', dbError.message)
          // Don't fail registration if database insert fails
          // User can still login and we can handle missing DB record later
        } else {
          console.log('User record created successfully in database')
        }
      } catch (dbError) {
        console.error('Database error during signup:', dbError)
      }

      return { success: true }
    }

    console.log('Registration failed: No user returned')
    return { error: 'Registration failed' }
  } catch (error) {
    console.error('Signup catch error:', error)
    return { error: 'Registration failed: ' + (error instanceof Error ? error.message : 'Unknown error') }
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem('user')

    // Clear session cookies
    document.cookie = 'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT'

    // Dispatch custom event for immediate updates
    window.dispatchEvent(new Event('userUpdate'))
  } catch (error) {
    console.error('Sign out error:', error)
    // Still clean up localStorage even if Supabase signOut fails
    localStorage.removeItem('user')

    // Clear session cookies
    document.cookie = 'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT'

    window.dispatchEvent(new Event('userUpdate'))
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null

  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      return JSON.parse(userStr)
    }
  } catch (error) {
    console.error('Error parsing user:', error)
    localStorage.removeItem('user')
  }

  return null
}

export function isAuthenticated(): boolean {
  const user = getCurrentUser()
  return user !== null
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  // Check role from metadata or default admin emails
  const adminEmails = ['admin@publichealthy.com', 'admin@example.com', 'evo_reaction022@hotmail.com']
  return !!(user?.role === 'ADMIN' || user?.role === 'MODERATOR' || (user && adminEmails.includes(user.email)))
}

export function canAccessDashboard(): boolean {
  return isAdmin()
}