'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient()
        
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error.message)
          router.push('/login?error=oauth_failed')
          return
        }

        if (data.session) {
          // User is authenticated, create user record if needed
          const user = data.session.user
          console.log('OAuth user authenticated:', user.email)
          
          try {
            // Try to create user record (will fail if already exists, which is fine)
            const { error: dbError } = await supabase
              .from('users')
              .insert([
                {
                  id: user.id,
                  email: user.email,
                  name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
                  role: 'USER',
                  status: 'PENDING'
                }
              ])
            
            if (dbError && !dbError.message.includes('duplicate key')) {
              console.error('Database insert error:', dbError.message)
            }
          } catch (dbError) {
            console.error('Database error during OAuth:', dbError)
          }

          // Store user info for the frontend
          const userData = {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
            role: 'USER',
            status: 'PENDING'
          }
          
          localStorage.setItem('user', JSON.stringify(userData))
          
          // Set session cookies
          if (data.session.access_token) {
            document.cookie = `sb-access-token=${data.session.access_token}; Path=/; SameSite=Lax`
          }
          if (data.session.refresh_token) {
            document.cookie = `sb-refresh-token=${data.session.refresh_token}; Path=/; SameSite=Lax`
          }

          // Dispatch user update event
          window.dispatchEvent(new Event('userUpdate'))
          
          router.push('/dashboard')
        } else {
          console.log('No session found in callback')
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">กำลังประมวลผล...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    }>
      <AuthCallback />
    </Suspense>
  )
}