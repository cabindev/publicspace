import { createClient } from './supabase/client'

export interface User {
  id: string
  email: string
  name?: string
  role?: 'USER' | 'ADMIN' | 'MODERATOR'
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ACTIVE'
}

export async function signIn(email: string, password: string): Promise<{ user?: User; error?: string }> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      // Get user role from database
      let roleData = { role: 'USER', status: 'PENDING' }
      try {
        const roleResponse = await fetch('/api/user/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.user.email })
        })
        
        if (roleResponse.ok) {
          const response = await roleResponse.json()
          roleData = {
            role: (response.role || 'USER') as 'USER' | 'ADMIN' | 'MODERATOR',
            status: (response.status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ACTIVE'
          }
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
      return { error: error.message }
    }

    if (data.user) {
      return { success: true }
    }

    return { error: 'Registration failed' }
  } catch (error) {
    return { error: 'Registration failed' }
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
  const adminEmails = ['admin@publichealthy.com', 'admin@example.com']
  return !!(user?.role === 'ADMIN' || user?.role === 'MODERATOR' || (user && adminEmails.includes(user.email)))
}

export function canAccessDashboard(): boolean {
  return isAdmin()
}