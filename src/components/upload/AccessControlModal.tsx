'use client'

import { useState } from 'react'
import { X, Lock, Globe, Users, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AccessControlModalProps {
  isOpen: boolean
  fileName: string
  onConfirm: (settings: AccessSettings) => void
  onCancel: () => void
}

export interface AccessSettings {
  isPublic: boolean
  allowDownload: boolean
  allowPrint: boolean
  allowShare: boolean
  expiryDays: number | null
  expiryDate: Date | null
  accessLevel: 'view' | 'edit' | 'full'
}

export function AccessControlModal({
  isOpen,
  fileName,
  onConfirm,
  onCancel,
}: AccessControlModalProps) {
  const [isPublic, setIsPublic] = useState(false)
  const [allowDownload, setAllowDownload] = useState(true)
  const [allowPrint, setAllowPrint] = useState(true)
  const [allowShare, setAllowShare] = useState(false)
  const [expiryDays, setExpiryDays] = useState<number | null>(null)
  const [expiryDate, setExpiryDate] = useState<Date | null>(null)
  const [expiryMode, setExpiryMode] = useState<'preset' | 'custom'>('preset')
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit' | 'full'>('view')

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm({
      isPublic,
      allowDownload,
      allowPrint,
      allowShare,
      expiryDays,
      expiryDate,
      accessLevel,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      
      <Card className="relative z-10 w-full max-w-lg mx-4 p-6 bg-gray-900/95 backdrop-blur-xl border-2 border-purple-500/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Access Control</h3>
            <p className="text-sm text-gray-400 mt-1 truncate">{fileName}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Public/Private Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Visibility
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsPublic(false)}
                className={cn(
                  "flex-1 p-3 rounded-lg border-2 transition-all",
                  !isPublic
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                )}
              >
                <Lock className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm font-medium">Private</p>
              </button>
              <button
                onClick={() => setIsPublic(true)}
                className={cn(
                  "flex-1 p-3 rounded-lg border-2 transition-all",
                  isPublic
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
                )}
              >
                <Globe className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm font-medium">Public</p>
              </button>
            </div>
          </div>

          {/* Access Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Access Level
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as any)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="view">View Only</option>
              <option value="edit">View & Edit</option>
              <option value="full">Full Access</option>
            </select>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Permissions</label>
            
            {/* Allow Download */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Allow Download</span>
              <button
                onClick={() => setAllowDownload(!allowDownload)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  allowDownload ? "bg-purple-600" : "bg-gray-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                    allowDownload ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>

            {/* Allow Print */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Allow Print</span>
              <button
                onClick={() => setAllowPrint(!allowPrint)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  allowPrint ? "bg-purple-600" : "bg-gray-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                    allowPrint ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>

            {/* Allow Share */}
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-sm text-gray-300">Allow Share</span>
              <button
                onClick={() => setAllowShare(!allowShare)}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-colors",
                  allowShare ? "bg-purple-600" : "bg-gray-700"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                    allowShare ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Expiry */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Link Expiry
            </label>
            
            {/* Expiry Mode Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setExpiryMode('preset')}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  expiryMode === 'preset'
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                )}
              >
                Preset
              </button>
              <button
                onClick={() => setExpiryMode('custom')}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  expiryMode === 'custom'
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                )}
              >
                Custom Date
              </button>
            </div>

            {expiryMode === 'preset' ? (
              <select
                value={expiryDays?.toString() || ""}
                onChange={(e) => {
                  setExpiryDays(e.target.value ? Number(e.target.value) : null)
                  setExpiryDate(null)
                }}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Never</option>
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            ) : (
              <input
                type="datetime-local"
                value={expiryDate ? new Date(expiryDate.getTime() - expiryDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  setExpiryDate(e.target.value ? new Date(e.target.value) : null)
                  setExpiryDays(null)
                }}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-700 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Upload File
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
