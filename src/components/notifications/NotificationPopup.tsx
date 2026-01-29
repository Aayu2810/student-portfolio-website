'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, X, Download } from 'lucide-react'
import { Button } from '../ui/button'

interface NotificationPopupProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  documentTitle?: string
  documentUrl?: string
  actionText?: string
  onAction?: () => void
}

export function NotificationPopup({
  isOpen,
  onClose,
  type,
  title,
  message,
  documentTitle,
  documentUrl,
  actionText,
  onAction
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />
      default:
        return <CheckCircle className="w-8 h-8 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 border-green-600'
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600 border-red-600'
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div
        className={`relative max-w-md w-full ${getBgColor()} border-2 rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-white">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-center mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-center text-white/90 mb-6">
            {message}
          </p>

          {/* Document Info */}
          {documentTitle && (
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium mb-1">Document:</p>
              <p className="text-white/80">{documentTitle}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex gap-3">
            {actionText && onAction && (
              <Button
                onClick={onAction}
                className="flex-1 bg-white text-gray-900 hover:bg-gray-100 font-medium"
              >
                {actionText}
              </Button>
            )}
            
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-white text-white hover:bg-white/10 font-medium"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Global notification state
let globalNotification: {
  isOpen: boolean
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  documentTitle?: string
  documentUrl?: string
  actionText?: string
  onAction?: () => void
} | null = null

export function showNotification(notification: {
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  documentTitle?: string
  documentUrl?: string
  actionText?: string
  onAction?: () => void
}) {
  globalNotification = {
    ...notification,
    isOpen: true
  }
  // Trigger re-render by dispatching a custom event
  window.dispatchEvent(new CustomEvent('showNotification'))
}

export function useGlobalNotification() {
  const [notification, setNotification] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'info'
    title: string
    message: string
    documentTitle?: string
    documentUrl?: string
    actionText?: string
    onAction?: () => void
  } | null>(globalNotification)

  useEffect(() => {
    const handleShowNotification = () => {
      if (globalNotification) {
        setNotification({
          isOpen: globalNotification.isOpen,
          type: globalNotification.type,
          title: globalNotification.title,
          message: globalNotification.message,
          documentTitle: globalNotification.documentTitle,
          documentUrl: globalNotification.documentUrl,
          actionText: globalNotification.actionText,
          onAction: globalNotification.onAction
        })
      }
    }

    window.addEventListener('showNotification', handleShowNotification)
    return () => {
      window.removeEventListener('showNotification', handleShowNotification)
    }
  }, [])

  const closeNotification = () => {
    globalNotification = null
    setNotification(null)
  }

  return {
    notification,
    closeNotification
  }
}
