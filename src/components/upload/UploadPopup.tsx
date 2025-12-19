'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X, AlertCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface UploadPopupProps {
  isOpen: boolean
  fileName: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  errorMessage?: string
  onClose: () => void
}

export function UploadPopup({
  isOpen,
  fileName,
  progress,
  status,
  errorMessage,
  onClose,
}: UploadPopupProps) {
  const [showCloseButton, setShowCloseButton] = useState(false)

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      // Show close button after animation completes
      const timer = setTimeout(() => {
        setShowCloseButton(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setShowCloseButton(false)
    }
  }, [status])

  // Auto close on success after 3 seconds
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={status !== 'uploading' ? onClose : undefined} />
      
      <Card className={cn(
        "relative z-10 w-full max-w-md mx-4 p-6 pointer-events-auto",
        "bg-gray-900/95 backdrop-blur-xl border-2",
        status === 'success' && "border-green-500/50",
        status === 'error' && "border-red-500/50",
        status === 'uploading' && "border-purple-500/50"
      )}>
        {/* Close Button (only show after upload completes) */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        )}

        <div className="space-y-4">
          {/* Icon and Status */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center w-16 h-16 rounded-full transition-all",
              status === 'uploading' && "bg-purple-500/20",
              status === 'success' && "bg-green-500/20 scale-110",
              status === 'error' && "bg-red-500/20 scale-110"
            )}>
              {status === 'uploading' && (
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="w-8 h-8 text-green-400 animate-in zoom-in duration-500" />
              )}
              {status === 'error' && (
                <AlertCircle className="w-8 h-8 text-red-400 animate-in zoom-in duration-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-lg font-semibold transition-colors",
                status === 'uploading' && "text-purple-400",
                status === 'success' && "text-green-400",
                status === 'error' && "text-red-400"
              )}>
                {status === 'uploading' && 'Uploading...'}
                {status === 'success' && 'Upload Successful!'}
                {status === 'error' && 'Upload Failed'}
              </h3>
              <p className="text-sm text-gray-400 truncate mt-1">
                {fileName}
              </p>
            </div>
          </div>

          {/* Progress Bar (only show while uploading) */}
          {status === 'uploading' && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{progress}% complete</span>
                <span className="text-gray-500">Please wait...</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-300">
                Your file has been uploaded successfully and is now available in your locker.
              </p>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
              <p className="text-sm font-medium text-red-300">
                {errorMessage || 'An error occurred during upload'}
              </p>
              <p className="text-xs text-gray-400">
                Please try again or contact support if the problem persists.
              </p>
            </div>
          )}

          {/* Retry Button (only show on error) */}
          {status === 'error' && showCloseButton && (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}
