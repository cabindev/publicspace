import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { validateEnvironment } from '../env-validation'

export function createClient() {
  // Environment variables with fallbacks for the current deployment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://latplvqjbpclasvvtpeu.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHBsdnFqYnBjbGFzdnZ0cGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTM0MjcsImV4cCI6MjA4MTY4OTQyN30.Vg11JNWrQt8Q3vMY7oM3Y8iRAJv7AWc4bgkU3Jv7j-A'

  if (!supabaseUrl || supabaseUrl === 'your-project-url') {
    console.error('Invalid NEXT_PUBLIC_SUPABASE_URL')
    throw new Error('Please configure NEXT_PUBLIC_SUPABASE_URL in your environment')
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    console.error('Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error('Please configure NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment')
  }


  return createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null
            try {
              return localStorage.getItem(key)
            } catch (error) {
              return null
            }
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.setItem(key, value)
            } catch (error) {
            }
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.removeItem(key)
            } catch (error) {
            }
          }
        }
      }
    }
  )
}
