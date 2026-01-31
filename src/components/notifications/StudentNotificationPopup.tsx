'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  created_at: string
  read: boolean
}

export function StudentNotificationPopup() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { notifications, markAsRead } = useNotifications()

  useEffect(() => {
    // Show the latest unread notification from the realtime hook
    const unreadNotifications = notifications.filter((n: Notification) => !n.read)
    
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[0]
      setCurrentNotification(latestNotification)
      setIsVisible(true)
      
      // Auto-hide after 5 seconds
      const timeout = setTimeout(() => {
        setIsVisible(false)
      }, 5000)
      
      return () => clearTimeout(timeout)
    }
  }, [notifications])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />
      default:
        return <Info className="w-8 h-8 text-blue-500" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-green-700 border-green-500'
      case 'error':
        return 'bg-gradient-to-r from-red-600 to-red-700 border-red-500'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500'
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500'
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    
    // Mark notification as read using the hook
    if (currentNotification) {
      markAsRead(currentNotification.id)
    }
  }

  if (!isVisible || !currentNotification) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right duration-300">
      <div className={`${getBackgroundColor(currentNotification.type)} border-2 rounded-lg shadow-2xl p-6 text-white`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getIcon(currentNotification.type)}
            <div>
              <h3 className="text-xl font-bold">{currentNotification.title}</h3>
              <p className="text-sm opacity-90">
                {new Date(currentNotification.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-white leading-relaxed">{currentNotification.message}</p>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClose}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
