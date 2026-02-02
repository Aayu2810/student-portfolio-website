import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '../lib/supabase/client'
import { Profile } from '../types'
import { User } from '@supabase/supabase-js'
import { showNotification } from '../components/notifications/NotificationPopup'

// Use singleton client for consistent auth state
const supabase = getSupabaseClient()

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log('[useUser] Fetching profile for user:', userId)
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, avatar_url, bio, phone, portfolio_url, linkedin_url, github_url, twitter_url, website_url, storage_used, storage_limit, role, created_at, updated_at')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('[useUser] Profile fetch error:', profileError)
        // Don't throw - profile might not exist yet (new user)
        return null
      }

      const profileData = data as Profile
      console.log('[useUser] Profile fetched successfully')
      return profileData
    } catch (err: any) {
      console.error('[useUser] Profile fetch exception:', err)
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    console.log('[useUser] Initializing auth listener...')

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

        if (authError) {
          console.error('[useUser] Auth error:', authError)
          if (isMounted) {
            setError(authError.message)
            setUser(null)
            setProfile(null)
            setLoading(false)
            setInitialized(true)
          }
          return
        }

        console.log('[useUser] Auth user:', authUser?.email || 'null')

        if (isMounted) {
          setUser(authUser)
          setError(null)
        }

        // Fetch profile if user exists
        if (authUser && isMounted) {
          const profileData = await fetchProfile(authUser.id)
          if (isMounted) {
            setProfile(profileData)
          }
        }

        if (isMounted) {
          setLoading(false)
          setInitialized(true)
          console.log('[useUser] Initial auth complete, user:', authUser?.email || 'none')
        }
      } catch (err: any) {
        console.error('[useUser] Init error:', err)
        if (isMounted) {
          setError(err.message || 'Failed to initialize auth')
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useUser] Auth state change:', event, 'User:', session?.user?.email || 'null')

        if (!isMounted) return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setUser(session?.user ?? null)
          setError(null)

          // Show welcome notification ONLY on actual sign in
          if (event === 'SIGNED_IN' && session?.user) {
            showNotification({
              type: 'success',
              title: 'Welcome Back! 🎉',
              message: `Successfully signed in as ${session.user.email}`,
              actionText: 'Get Started'
            })
          }

          // Always refetch profile on auth events
          if (session?.user) {
            console.log('[useUser] Refetching profile after', event)
            const profileData = await fetchProfile(session.user.id)
            if (isMounted) {
              setProfile(profileData)
              setLoading(false)
            }
          } else {
            setProfile(null)
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[useUser] User signed out, clearing state')
          setUser(null)
          setProfile(null)
          setError(null)
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('[useUser] Cleaning up auth listener')
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  return {
    user,
    profile,
    loading,
    error,
    initialized, // True once initial auth check is complete
    isAuthenticated: !!user && initialized,
    hasProfile: !!profile
  }
}
