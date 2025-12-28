'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { canAccessDashboard } from '@/lib/auth'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    if (user) {
      const access = canAccessDashboard()
      setHasAccess(access)
    } else {
      setHasAccess(false)
    }
  }, [user])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/healthy.svg"
                alt="Healthy Public Spaces"
                width={200}
                height={50}
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Healthy Public Spaces</h1>
                <p className="text-sm text-gray-600">พื้นที่สาธารณะเพื่อสุขภาพ</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/healthy" 
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              รายงานพื้นที่สาธารณะ
            </Link>
            
            {user ? (
              <>
                {hasAccess && (
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    สวัสดี, {user.name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigningOut ? 'กำลังออก...' : 'ออกจากระบบ'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link 
                  href="/register" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/healthy" 
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                รายงานพื้นที่สาธารณะ
              </Link>
              
              {user ? (
                <>
                  {hasAccess && (
                    <Link 
                      href="/dashboard" 
                      className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      สวัสดี, {user.name || user.email}
                    </p>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      disabled={isSigningOut}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigningOut ? 'กำลังออก...' : 'ออกจากระบบ'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    สมัครสมาชิก
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}