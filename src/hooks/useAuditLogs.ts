import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRealtimeAuditLogs } from './useRealtime'

export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
  created_at: string
  user_email?: string
}

export function useAuditLogs(limit: number = 100) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch initial audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('audit_logs')
          .select(`
            *,
            profiles!audit_logs_user_id_fkey (
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error

        // Transform data to include user_email
        const transformedLogs = data?.map(log => ({
          ...log,
          user_email: log.profiles?.email
        })) || []

        setLogs(transformedLogs)
      } catch (error: any) {
        console.error('Error fetching audit logs:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [limit])

  // Real-time updates
  useRealtimeAuditLogs((payload: any) => {
    console.log('Audit log real-time update:', payload)
    
    if (payload.eventType === 'INSERT') {
      const newLog = payload.new as AuditLog
      setLogs(prev => {
        // Avoid duplicates
        if (prev.some(log => log.id === newLog.id)) {
          return prev
        }
        return [newLog, ...prev].slice(0, limit)
      })
    }
  })

  const createAuditLog = async (logData: Omit<AuditLog, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          ...logData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating audit log:', error)
      return null
    }
  }

  const getLogsByUser = (userId: string) => {
    return logs.filter(log => log.user_id === userId)
  }

  const getLogsByAction = (action: string) => {
    return logs.filter(log => log.action === action)
  }

  const getLogsByResource = (resourceType: string, resourceId?: string) => {
    return logs.filter(log => 
      log.resource_type === resourceType && 
      (!resourceId || log.resource_id === resourceId)
    )
  }

  return {
    logs,
    loading,
    error,
    createAuditLog,
    getLogsByUser,
    getLogsByAction,
    getLogsByResource
  }
}
