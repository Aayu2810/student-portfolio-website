'use client'

import { useState } from 'react'
import { X, Copy, QrCode, Check } from 'lucide-react'

interface PortfolioShareModalProps {
  onClose: () => void
}

export default function PortfolioShareModal({ onClose }: PortfolioShareModalProps) {
  const [shareUrl, setShareUrl] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiresIn, setExpiresIn] = useState('24')
  const [maxAccess, setMaxAccess] = useState('')

  const generateShareLink = async () => {
    setLoading(true)
    try {
      // Generate portfolio URL for demo with proper username
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const portfolioUrl = `${baseUrl}/portfolio/johndoe`
      
      setShareUrl(portfolioUrl)
      
      // Generate QR code using same service as documents
      const qrResponse = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portfolioUrl)}`
      )
      setQrDataUrl(qrResponse.url)
      
    } catch (error) {
      console.error('Share error:', error)
      alert('Failed to generate share link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = 'portfolio-qr-code.png'
    link.click()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Share Portfolio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share your professional portfolio
            </label>
            <p className="text-sm text-gray-400">
              Recipients will be able to view your portfolio and download documents
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link Expiration (hours)
            </label>
            <input
              type="number"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="24"
              min="1"
              max="720"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Access Count (optional)
            </label>
            <input
              type="number"
              value={maxAccess}
              onChange={(e) => setMaxAccess(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Unlimited"
              min="1"
            />
          </div>
        </div>

        {!shareUrl ? (
          <button
            onClick={generateShareLink}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Share Link'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {qrDataUrl && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  QR Code
                </label>
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="mx-auto mb-3 rounded-lg"
                  width={250}
                  height={250}
                />
                <button
                  onClick={downloadQR}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <QrCode className="w-4 h-4" />
                  Download QR Code
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
