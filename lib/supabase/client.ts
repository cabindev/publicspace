import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { validateEnvironment } from '../env-validation'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://latplvqjbpclasvvtpeu.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHBsdnFqYnBjbGFzdnZ0cGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTM0MjcsImV4cCI6MjA4MTY4OTQyN30.Vg11JNWrQt8Q3vMY7oM3Y8iRAJv7AWc4bgkU3Jv7j-A'

  if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    throw new Error('supabaseUrl is required')
  }

  if (!supabaseAnonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
    throw new Error('supabaseAnonKey is required')
  }

  console.log('Initializing Supabase client with URL:', supabaseUrl.substring(0, 30) + '...')
  console.log('Environment loaded from:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '.env.local' : 'fallback values')

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
            return localStorage.getItem(key)
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return
            localStorage.setItem(key, value)
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return
            localStorage.removeItem(key)
          }
        }
      }
    }
  )
}
