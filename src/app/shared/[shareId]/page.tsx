'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Clock, AlertCircle } from 'lucide-react'
import { useParams } from 'next/navigation'

interface SharedDocument {
  id: string
  title: string
  description: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  category: string
}

export default function SharedDocumentsPage() {
  const params = useParams()
  const shareId = params?.shareId as string || ''
  const [documents, setDocuments] = useState<SharedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  useEffect(() => {
    const fetchSharedDocuments = async () => {
      // Check if shareId exists before making request
      if (!shareId) {
        setError('Invalid share link')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/share?code=${encodeURIComponent(shareId)}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to load documents')
          setLoading(false)
          return
        }

        const data = await response.json()
        // Fix: properly extract documents from the response
        const docs = data.share_links.map((link: any) => link.documents)
        setDocuments(docs.flat()) // Flatten in case there are multiple documents per link
        
        if (data.share_links[0]?.expires_at) {
          setExpiresAt(data.share_links[0].expires_at)
        }

        // Increment access count
        data.share_links.forEach(async (link: any) => {
          await fetch('/api/share/access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ share_link_id: link.id })
          })
        })
      } catch (err) {
        setError('Failed to load shared documents')
      } finally {
        setLoading(false)
      }
    }

    if (shareId) {
      fetchSharedDocuments()
    } else {
      setLoading(false)
      setError('Invalid share link')
    }
  }, [shareId])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading shared documents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl border border-red-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Shared Documents</h1>
            <p className="text-gray-400">
              {documents.length} document{documents.length !== 1 ? 's' : ''} shared with you
            </p>
            {expiresAt && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-300 text-sm">
                  Expires: {new Date(expiresAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-purple-900/30 rounded-lg">
                    <FileText className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-1 truncate">
                      {doc.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {doc.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-300 text-sm rounded-full">
                    {doc.category}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatFileSize(doc.file_size)}
                  </span>
                </div>

                <a
                  href={`/api/shared-download/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-block text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
