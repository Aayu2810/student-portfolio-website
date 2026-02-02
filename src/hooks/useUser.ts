import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { Profile } from '../types'
import { User } from '@supabase/supabase-js'
import { showNotification } from '../components/notifications/NotificationPopup'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const [hasShownWelcome, setHasShownWelcome] = useState(false)

  useEffect(() => {
    let isMounted = true;
    
    const fetchUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Auth error:', authError)
          if (isMounted) {
            setError(authError.message);
            setLoading(false);
          }
          return;
        }
        
        if (isMounted) {
          setUser(authUser)
          setError(null);
        }

        if (authUser && isMounted) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name, avatar_url, bio, phone, portfolio_url, linkedin_url, github_url, twitter_url, website_url, storage_used, storage_limit, role, created_at, updated_at')
            .eq('id', authUser.id)
            .single()
            
          if (profileError) {
            console.error('Profile fetch error:', profileError);
          } else {
            setProfile(profileData)
          }
        }
      } catch (error: any) {
        console.error('Error fetching user:', error)
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle session refresh events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (isMounted) {
            setUser(session?.user ?? null)
            
            // Show welcome notification only on actual sign in, not on tab switch/token refresh
            if (event === 'SIGNED_IN' && session?.user && !hasShownWelcome) {
              showNotification({
                type: 'success',
                title: 'Welcome Back! 🎉',
                message: `Successfully signed in as ${session.user.email}`,
                actionText: 'Get Started'
              })
              setHasShownWelcome(true)
            }
            
            if (session?.user) {
              // Ensure loading is false when we have a user
              setLoading(false)
              
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, email, first_name, last_name, avatar_url, bio, phone, portfolio_url, linkedin_url, github_url, twitter_url, website_url, storage_used, storage_limit, role, created_at, updated_at')
                .eq('id', session.user.id)
                .single()
                
              if (profileError) {
                console.error('Profile fetch error on auth change:', profileError);
                setProfile(null);
              } else {
                setProfile(profileData)
              }
            } else {
              setProfile(null)
              setLoading(false)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setProfile(null);
            setHasShownWelcome(false); // Reset welcome flag for next sign in
            setLoading(false)
          }
        }
      }
    )

    return () => {
      isMounted = false;
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    profile,
    loading,
    error
  }
}