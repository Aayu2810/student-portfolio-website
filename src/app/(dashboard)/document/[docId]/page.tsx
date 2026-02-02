'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Eye, Share2, MoreVertical, Star, Trash2, Edit3, FolderInput, Archive, CheckCircle } from 'lucide-react'
import { createClient } from '../../../../lib/supabase/client'
import { Document } from '../../../../types'
import { Button } from '../../../../components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../../../components/ui/dropdown-menu'
import { Badge } from '../../../../components/ui/badge'
import { useUser } from '../../../../hooks/useUser'

export default function DocumentPage({ params }: { params: { docId: string } }) {
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { user } = useUser()

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        if (!user) {
          setError('User not authenticated')
          return
        }

        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', params.docId)
          .eq('user_id', user.id)
          .single()

        if (error) {
          setError(error.message)
          return
        }

        setDocument(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if user is available
    if (user) {
      fetchDocument()
    } else {
      setLoading(false)
    }
  }, [params.docId, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading document...</div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error || 'Document not found'}</div>
      </div>
    )
  }

  const handleAction = async (action: string) => {
    switch (action) {
      case 'preview':
        // Open preview modal
        break
      case 'download':
        // Download document
        window.open(`/api/download/${params.docId}`, '_blank')
        break
      case 'share':
        // Share document
        break
      case 'copyLink':
        // Copy share link
        navigator.clipboard.writeText(`${window.location.origin}/document/${params.docId}`)
        break
      case 'star':
        // Toggle favorite
        try {
          await supabase
            .from('documents')
            .update({ is_favorite: !document.is_favorite })
            .eq('id', document.id)
          
          setDocument({ ...document, is_favorite: !document.is_favorite })
        } catch (err) {
          console.error('Error toggling favorite:', err)
        }
        break
      case 'rename':
        // Rename document
        break
      case 'move':
        // Move document
        break
      case 'archive':
        // Archive document
        break
      case 'delete':
        // Delete document
        break
      default:
        break
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{document.title}</h1>
              <p className="text-gray-400">{document.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-gray-700 hover:bg-gray-800 text-white"
              onClick={() => handleAction('download')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800/95 backdrop-blur-md border-white/10">
                <DropdownMenuItem 
                  onClick={() => handleAction('preview')}
                  className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                >
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span>Preview</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAction('download')}
                  className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAction('share')}
                  className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                >
                  <Share2 className="w-4 h-4 text-green-400" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAction('copyLink')}
                  className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAction('star')}
                  className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>{document.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAction('rename')}
                  className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAction('move')}
                  className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                >
                  <FolderInput className="w-4 h-4 text-indigo-400" />
                  <span>Move to Folder</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAction('archive')}
                  className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                >
                  <Archive className="w-4 h-4 text-gray-400" />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAction('delete')}
                  className="flex items-center gap-3 cursor-pointer text-red-400 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Document Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">File Type</h3>
            <p className="text-white font-medium">{document.file_type}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Size</h3>
            <p className="text-white font-medium">{(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm mb-2">Status</h3>
            <div className="flex items-center gap-2">
              <Badge className={document.is_public ? "bg-green-500/20 text-green-500 border-green-500" : "bg-amber-500/20 text-amber-500 border-amber-500"}>
                {document.is_public ? 'Verified' : 'Pending'}
              </Badge>
              {document.is_public && (
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  RVCE Authenticated
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Document Preview</h2>
          <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-purple-900/20 to-transparent rounded-xl border border-white/5">
            {document.file_type.startsWith('image/') ? (
              <img 
                src={document.file_url} 
                alt={document.title} 
                className="max-w-full max-h-[500px] object-contain rounded-lg"
              />
            ) : document.file_type === 'application/pdf' ? (
              <iframe 
                src={`/api/preview/${params.docId}`} 
                className="w-full h-[500px] rounded-lg bg-white"
                title={document.title}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-400">
                <FileText className="w-20 h-20" />
                <p className="text-lg">Preview not available</p>
                <p className="text-sm">Download the file to view it</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Details */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-400 text-sm mb-2">File Name</h3>
              <p className="text-white">{document.file_name}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Created</h3>
              <p className="text-white">{new Date(document.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Description</h3>
              <p className="text-white">{document.description || 'No description'}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Views</h3>
              <p className="text-white">{document.views}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}