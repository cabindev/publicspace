'use client'

import { useState, useEffect } from 'react'
import { User, getCurrentUser, signOut as authSignOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for existing user
    const checkUser = async () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
        setError(null)
      } catch (err) {
        console.error('Error checking user:', err)
        setError('Failed to check authentication')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'user') {
        try {
          const currentUser = getCurrentUser()
          setUser(currentUser)
          setError(null)
        } catch (err) {
          console.error('Error updating user from storage:', err)
          setError('Failed to update authentication')
          setUser(null)
        }
      }
    }

    // Also listen for custom events for immediate updates
    const handleUserUpdate = async () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
        setError(null)
      } catch (err) {
        console.error('Error updating user:', err)
        setError('Failed to update authentication')
        setUser(null)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userUpdate', handleUserUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userUpdate', handleUserUpdate)
    }
  }, [])

  const signOut = async () => {
    try {
      await authSignOut()
      setUser(null)
      setError(null)
      router.push('/')
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out')
    }
  }

  return {
    user,
    loading,
    error,
    signOut,
    isAuthenticated: user !== null
  }
}