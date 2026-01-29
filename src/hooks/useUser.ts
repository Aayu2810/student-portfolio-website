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
            .select('*')
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
            
            // Show welcome notification on sign in
            if (event === 'SIGNED_IN' && session?.user) {
              showNotification({
                type: 'success',
                title: 'Welcome Back! 🎉',
                message: `Successfully signed in as ${session.user.email}`,
                actionText: 'Get Started'
              })
            }
            
            if (session?.user) {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
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
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setProfile(null);
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