'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { FileText, Download, Eye, Clock, AlertCircle } from 'lucide-react'
import { Button } from '../../../components/ui/button'

interface SharedDocument {
  id: string
  title: string
  description: string | null
  category: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  created_at: string
}

interface ShareLink {
  id: string
  document_id: string
  share_code: string
  expires_at: string | null
  max_access: number | null
  access_count: number
  is_active: boolean
}

export default function SharedPage() {
  const params = useParams()
  const router = useRouter()
  const [documents, setDocuments] = useState<SharedDocument[]>([])
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadSharedDocuments = async () => {
      try {
        const shareCode = params.code as string

        // Find all share links with this code pattern
        const { data: shareLinks, error: shareError } = await supabase
          .from('share_links')
          .select('*')
          .like('share_code', `${shareCode}%`)
          .eq('is_active', true)

        if (shareError) throw shareError

        if (!shareLinks || shareLinks.length === 0) {
          setError('This share link is invalid or has expired.')
          setLoading(false)
          return
        }

        // Check if any link is expired
        const validLinks = shareLinks.filter((link: ShareLink) => {
          if (!link.expires_at) return true
          return new Date(link.expires_at) > new Date()
        })

        if (validLinks.length === 0) {
          setError('This share link has expired.')
          setLoading(false)
          return
        }

        // Check access limits
        const accessibleLinks = validLinks.filter((link: ShareLink) => {
          if (!link.max_access) return true
          return link.access_count < link.max_access
        })

        if (accessibleLinks.length === 0) {
          setError('This share link has reached its access limit.')
          setLoading(false)
          return
        }

        // Get document IDs
        const documentIds = accessibleLinks.map((link: ShareLink) => link.document_id)

        // Fetch documents
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select('id, title, description, category, file_name, file_type, file_size, storage_path, created_at')
          .in('id', documentIds)

        if (docsError) throw docsError

        setDocuments(docs || [])
        setShareLink(accessibleLinks[0])

        // Increment access count for all links using atomic function
        for (const link of accessibleLinks) {
          await supabase.rpc('increment_access_count', {
            link_id: link.id
          })
        }

        setLoading(false)
      } catch (err) {
        console.error('Error loading shared documents:', err)
        setError('Failed to load shared documents.')
        setLoading(false)
      }
    }

    if (params.code) {
      loadSharedDocuments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.code]) // Removed supabase to prevent infinite loop

  const downloadDocument = async (doc: SharedDocument) => {
    try {
      const { data: signedUrl, error } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(doc.storage_path, 3600) // 1 hour expiry

      if (error) throw error

      const link = document.createElement('a')
      link.href = signedUrl.signedUrl
      link.download = doc.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading document:', err)
      alert('Failed to download document')
    }
  }

  const previewDocument = async (doc: SharedDocument) => {
    try {
      const { data: signedUrl, error } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(doc.storage_path, 3600)

      if (error) throw error

      window.open(signedUrl.signedUrl, '_blank')
    } catch (err) {
      console.error('Error previewing document:', err)
      alert('Failed to preview document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading shared documents...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-slate-800/50 backdrop-blur-md rounded-lg border border-red-500/20">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-white/10 p-8 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Shared Documents</h1>
          <p className="text-gray-300">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'} shared with you
          </p>
          {shareLink?.expires_at && (
            <div className="flex items-center gap-2 mt-4 text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Expires: {new Date(shareLink.expires_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {documents.map((doc: SharedDocument) => (
            <div
              key={doc.id}
              className="bg-slate-800/50 backdrop-blur-md rounded-lg border border-white/10 p-6 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-gray-400 text-sm mb-3">{doc.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                      <span className="px-2 py-1 bg-slate-700/50 rounded">
                        {doc.category}
                      </span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => previewDocument(doc)}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/50 hover:bg-purple-500/10"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => downloadDocument(doc)}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No documents found</p>
          </div>
        )}
      </div>
    </div>
  )
}
