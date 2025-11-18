'use client'

import { useState, useRef } from 'react'
import { FileText, Upload, Search, Trash2, Share2, Download, Star, Filter } from 'lucide-react'
import { useDocuments } from '../../../hooks/useDocuments'
import { useUser } from '../../../hooks/useUser'
import DocumentShareModal from '../../../components/documents/DocumentShareModal'

export default function DocumentsPage() {
  const { documents, loading, deleteDocument, updateDocument, refetch } = useDocuments()
  const { profile } = useUser()
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    formData.append('category', categoryFilter !== 'all' ? categoryFilter : 'other')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await refetch()
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        const error = await response.json()
        alert(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      await deleteDocument(docId)
    } catch (error) {
      alert('Failed to delete document')
    }
  }

  const toggleFavorite = async (docId: string, currentState: boolean) => {
    try {
      await updateDocument(docId, { is_favorite: !currentState })
    } catch (error) {
      alert('Failed to update favorite status')
    }
  }

  const toggleSelection = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const storagePercentage = profile 
    ? (profile.storage_used / profile.storage_limit) * 100 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-gray-400">Manage all your academic documents in one place</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="resume">Resume</option>
              <option value="certificate">Certificate</option>
              <option value="transcript">Transcript</option>
              <option value="project">Project</option>
              <option value="other">Other</option>
            </select>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {selectedDocs.length > 0 && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setShareModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share {selectedDocs.length} Selected
              </button>
              <button
                onClick={() => setSelectedDocs([])}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Clear Selection
              </button>
            </div>
          )}

          {filteredDocs.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {documents.length === 0 ? 'No documents yet' : 'No documents found'}
              </h3>
              <p className="text-gray-400 mb-6">
                {documents.length === 0 
                  ? 'Start building your digital portfolio by uploading your first document'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`bg-gray-800/50 border rounded-lg p-4 hover:border-purple-500 transition-all ${
                    selectedDocs.includes(doc.id) ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleSelection(doc.id)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleFavorite(doc.id, doc.is_favorite)}
                        className="text-gray-400 hover:text-yellow-500"
                      >
                        <Star className={`w-5 h-5 ${doc.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h3 className="text-white font-semibold mb-1 truncate">{doc.title}</h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">{doc.description || 'No description'}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded">
                        {doc.category}
                      </span>
                      <span className="text-gray-500 text-xs">{formatFileSize(doc.file_size)}</span>
                    </div>
                  </div>

                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Storage</div>
            <div className="text-2xl font-bold text-white">
              {formatFileSize(profile?.storage_used || 0)} / {formatFileSize(profile?.storage_limit || 524288000)}
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" 
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Documents</div>
            <div className="text-2xl font-bold text-white">{documents.length}</div>
          </div>
          
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Favorites</div>
            <div className="text-2xl font-bold text-yellow-500">
              {documents.filter(d => d.is_favorite).length}
            </div>
          </div>
        </div>
      </div>

      {shareModalOpen && (
        <DocumentShareModal
          documentIds={selectedDocs}
          onClose={() => {
            setShareModalOpen(false)
            setSelectedDocs([])
          }}
        />
      )}
    </div>
  )
}