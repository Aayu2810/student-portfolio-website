import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRealtimeNotifications } from './useRealtime'
import { useUser } from './useUser'
import { showNotification } from '../components/notifications/NotificationPopup'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
  data?: any
}

export function useNotifications() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch initial notifications
  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id, user_id, title, message, type, read, created_at, data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        setNotifications(data || [])
        setUnreadCount(data?.filter(n => !n.read).length || 0)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user])

  // Real-time updates
  useRealtimeNotifications(user?.id || '', (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const newNotification = payload.new as Notification
      setNotifications(prev => [newNotification, ...prev])
      if (!newNotification.read) {
        setUnreadCount(prev => prev + 1)
        
        // Show popup notification for new notifications
        showNotification({
          type: newNotification.type,
          title: newNotification.title,
          message: newNotification.message,
          documentTitle: newNotification.data?.document_title,
          documentUrl: newNotification.data?.document_url,
          actionText: 'View Details'
        })
      }
    } else if (payload.eventType === 'UPDATE') {
      const updatedNotification = payload.new as Notification
      setNotifications(prev => 
        prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
      )
      // Update unread count
      const oldNotification = payload.old as Notification
      if (oldNotification.read !== updatedNotification.read) {
        setUnreadCount(prev => 
          updatedNotification.read ? prev - 1 : prev + 1
        )
      }
    }
  })

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false)

      if (error) throw error
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification
  }
}
