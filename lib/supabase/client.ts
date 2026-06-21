import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { validateEnvironment } from '../env-validation'

export function createClient() {
  // Environment variables with fallbacks for the current deployment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kizvpsgapqhxlhukgsdm.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_fGcOt0fNmknygDVYQF6AXw_I4mo95b8'

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
