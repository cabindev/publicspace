import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (for production use Redis or similar)
const rateLimit = new Map<string, { count: number; lastReset: number }>()

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy - Allow Supabase connections
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self' https://*.supabase.co; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-src 'self' https://www.youtube.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
  )

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'
    const now = Date.now()
    const windowMs = 15 * 60 * 1000 // 15 minutes
    const limit = 100 // requests per window

    const key = `${ip}:${Math.floor(now / windowMs)}`
    const current = rateLimit.get(key) || { count: 0, lastReset: now }

    if (now - current.lastReset > windowMs) {
      current.count = 0
      current.lastReset = now
    }

    current.count++
    rateLimit.set(key, current)

    if (current.count > limit) {
      return new NextResponse('Too Many Requests', { 
        status: 429,
        headers: {
          'Retry-After': '900'
        }
      })
    }

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, v] of rateLimit.entries()) {
        if (now - v.lastReset > windowMs) {
          rateLimit.delete(k)
        }
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}