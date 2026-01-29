import { createClient } from './supabase/client'

export async function createAuditLog(data: {
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
}) {
  try {
    const supabase = createClient()
    
    const { data: log, error } = await supabase
      .from('audit_logs')
      .insert({
        ...data,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating audit log:', error)
      return null
    }

    console.log('Audit log created:', log)
    return log
  } catch (error) {
    console.error('Error in createAuditLog:', error)
    return null
  }
}

export async function createNotification(data: {
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  data?: any
}) {
  try {
    const supabase = createClient()
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        ...data,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    console.log('Notification created:', notification)
    return notification
  } catch (error) {
    console.error('Error in createNotification:', error)
    return null
  }
}
