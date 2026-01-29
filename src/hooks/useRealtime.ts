import { useEffect, useState, useRef } from 'react'
import { createClient } from '../lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeSubscription(
  table: string,
  filter?: string,
  callback?: (payload: any) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()
  const callbackRef = useRef(callback)

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!table) return

    const channelName = `${table}_realtime_${Date.now()}`
    
    console.log(`Setting up realtime subscription for ${table}`)
    
    const realtimeChannel = supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: filter
        }, 
        (payload) => {
          console.log(`Realtime update for ${table}:`, payload)
          callbackRef.current?.(payload)
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${table}:`, status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    setChannel(realtimeChannel)

    return () => {
      console.log(`Cleaning up realtime subscription for ${table}`)
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  }, [table, filter])

  return { channel, isConnected }
}

export function useRealtimeDocuments(userId: string, callback?: (payload: any) => void) {
  return useRealtimeSubscription(
    'documents',
    userId ? `user_id=eq.${userId}` : undefined,
    callback
  )
}

export function useRealtimeAuditLogs(callback?: (payload: any) => void) {
  return useRealtimeSubscription('audit_logs', undefined, callback)
}

export function useRealtimeNotifications(userId: string, callback?: (payload: any) => void) {
  return useRealtimeSubscription(
    'notifications',
    userId ? `user_id=eq.${userId}` : undefined,
    callback
  )
}

export function useRealtimeVerifications(callback?: (payload: any) => void) {
  return useRealtimeSubscription('verifications', undefined, callback)
}
