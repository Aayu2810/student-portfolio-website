'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { FileText, Folder, Search, Grid, List, Plus, Download, Eye, Share2, MoreVertical, Star, Trash2, Edit3, FolderInput, Archive, CheckCircle, Filter, X } from 'lucide-react'
import { createClient } from '../../../lib/supabase/client'
import { Document } from '../../../types'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../../../components/ui/dropdown-menu'
import { Badge } from '../../../components/ui/badge'
import { useUser } from '../../../hooks/useUser'
import { useDocuments } from '../../../hooks/useDocuments'
import { useRouter } from 'next/navigation'
import { ShareModal } from '../../../components/sharing/ShareModal'

// Categories from DocumentCategory component
const categories = [
  { id: "academic", name: "Academic", color: "text-blue-400" },
  { id: "certificates", name: "Certificates", color: "text-yellow-400" },
  { id: "professional", name: "Professional", color: "text-green-400" },
  { id: "identity", name: "Identity", color: "text-red-400" },
  { id: "personal", name: "Personal", color: "text-pink-400" },
  { id: "property", name: "Property", color: "text-orange-400" },
  { id: "other", name: "Other", color: "text-gray-400" },
];

export default function LockerPage() {
  const { documents, loading, error, mutate, deleteDocument, updateDocument } = useDocuments()
  const { user } = useUser()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareDocument, setShareDocument] = useState<{ id: string, name: string } | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClient()

  const loadMore = async () => {
    const nextPage = page + 1;
    // In a real implementation, you would fetch the next page of documents
    // For now, we'll just increment the page counter
    setPage(nextPage);
  };

  const handleAction = useCallback(async (action: string, docId: string) => {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return

    switch (action) {
      case 'preview':
        // Open document in new tab
        router.push(`/document/${docId}`)
        break
      case 'download':
        // Download document
        // For verified PDF documents, use the download API which adds the logo
        const downloadDocument = async () => {
          const link = globalThis.document.createElement('a');
          if (doc.is_public && doc.file_type === 'application/pdf') {
            link.href = `/api/download/${docId}`;
          } else {
            // For non-verified documents, use the direct download from storage
            const { data: signedUrl, error } = await supabase
              .storage
              .from('documents')
              .createSignedUrl(doc.storage_path, 3600); // 1 hour expiry
            
            if (error) {
              console.error('Error generating signed URL:', error);
              link.href = `/api/download/${docId}`;
            } else {
              link.href = signedUrl.signedUrl;
            }
          }
          link.download = doc.file_name;
          globalThis.document.body.appendChild(link);
          link.click();
          globalThis.document.body.removeChild(link);
        };
        downloadDocument(); // Call the async function without awaiting
        break
      case 'share':
        // Open share modal
        setShareDocument({ id: docId, name: doc.title });
        setShareModalOpen(true);
        break
      case 'copyLink':
        // Copy share link to clipboard
        const shareLink = `${window.location.origin}/locker/${docId}`;
        navigator.clipboard.writeText(shareLink);
        break
      case 'star':
        // Toggle favorite status
        try {
          await updateDocument(docId, { is_favorite: !doc.is_favorite });
        } catch (err) {
          console.error('Error toggling favorite:', err);
          alert('Failed to update favorite status. Please try again.');
        }
        break
      case 'rename':
        // Navigate to document page for renaming
        router.push(`/locker/${docId}`)
        break
      case 'move':
        // Navigate to document page for moving
        router.push(`/locker/${docId}`)
        break
      case 'delete':
        // Delete document
        if (confirm('Are you sure you want to delete this document?')) {
          try {
            await deleteDocument(docId);
            // Show success feedback
            alert('Document deleted successfully');
          } catch (err) {
            console.error('Error deleting document:', err);
            alert('Failed to delete document. Please try again.');
          }
        }
        break
      default:
        break
    }
  }, [documents, router, supabase, updateDocument, deleteDocument])

  // Function to handle document click and open in new tab using Chrome's PDF viewer
  const handleDocumentClick = useCallback(async (doc: Document) => {
    try {
      // For security reasons, we need to generate a signed URL for the document
      // This ensures the user has permission to access the document
      if (doc.storage_path) {
        // Generate a signed URL that expires in 1 hour
        const { data: signedUrl, error } = await supabase
          .storage
          .from('documents')
          .createSignedUrl(doc.storage_path, 3600) // 1 hour expiry

        if (error) {
          console.error('Error generating signed URL:', error);
          // Fallback to the download API if signed URL generation fails
          window.open(`/api/download/${doc.id}`, '_blank');
        } else {
          // For verified documents, use the preview API to ensure logo is added
          if (doc.is_public && doc.file_type === 'application/pdf') {
            window.open(`/api/preview/${doc.id}`, '_blank');
          } else {
            // For non-verified documents, use the signed URL
            window.open(signedUrl.signedUrl, '_blank');
          }
        }
      } else {
        // If no storage path is available, use the download API
        window.open(`/api/download/${doc.id}`, '_blank');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      // Fallback to document detail page if there's an error
      router.push(`/document/${doc.id}`)
    }
  }, [supabase, router])

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    
    return documents.filter(doc => {
      // Search filter
      const matchesSearch = 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category filter
      const matchesCategory = 
        selectedCategories.length === 0 || 
        selectedCategories.includes(doc.category);
      
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchQuery, selectedCategories]);

  // Function to toggle category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Function to clear all category filters
  const clearCategories = () => {
    setSelectedCategories([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading documents...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Document Locker</h1>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => router.push('/documents')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
        
        {/* Search Bar and Filters */}
        <div className="flex gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                Categories
                {selectedCategories.length > 0 && (
                  <Badge className="ml-2 bg-purple-600 text-white" variant="secondary">
                    {selectedCategories.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white w-64">
              <DropdownMenuLabel className="text-gray-300">Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                  className="hover:bg-gray-700 focus:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span className={category.color}>
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                    <span>{category.name}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              
              <DropdownMenuSeparator className="bg-gray-700" />
              
              {selectedCategories.length > 0 && (
                <DropdownMenuItem 
                  onClick={clearCategories}
                  className="hover:bg-gray-700 focus:bg-gray-700 text-red-400"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Active Category Filters */}
        {selectedCategories.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {selectedCategories.map((categoryId) => {
              const category = categories.find(c => c.id === categoryId);
              return (
                <Badge
                  key={categoryId}
                  variant="secondary"
                  className="bg-purple-600/20 text-purple-300 border-purple-600/30 cursor-pointer hover:bg-purple-600/30"
                  onClick={() => toggleCategory(categoryId)}
                >
                  {category?.name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              );
            })}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-400">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            {hasMore && (
              <button 
                onClick={loadMore}
                className="ml-4 text-purple-400 hover:text-purple-300 text-xs"
              >
                Load More
              </button>
            )}
          </div>
        </div>

        {/* Documents Grid/List */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 mb-6 text-lg">No documents found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all cursor-pointer group"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-slate-800/95 backdrop-blur-md border-white/10">
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('preview', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Eye className="w-4 h-4 text-purple-400" />
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('download', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Download className="w-4 h-4 text-blue-400" />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('share', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Share2 className="w-4 h-4 text-green-400" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('copyLink', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Share2 className="w-4 h-4 text-cyan-400" />
                        <span>Copy Link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('star', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{doc.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('rename', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Edit3 className="w-4 h-4 text-amber-400" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('move', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <FolderInput className="w-4 h-4 text-indigo-400" />
                        <span>Move to Folder</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('delete', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer text-red-400 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-medium text-white truncate mb-1">{doc.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{doc.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  {doc.is_public && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-4 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30 transition-colors cursor-pointer"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{doc.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-gray-400 text-sm">{doc.category}</span>
                      <span className="text-gray-500 text-xs">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {doc.is_public && (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm whitespace-nowrap">
                    {new Date(doc.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-slate-800/95 backdrop-blur-md border-white/10">
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('preview', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Eye className="w-4 h-4 text-purple-400" />
                        <span>Preview</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('download', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Download className="w-4 h-4 text-blue-400" />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('share', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Share2 className="w-4 h-4 text-green-400" />
                        <span>Share</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('copyLink', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Share2 className="w-4 h-4 text-cyan-400" />
                        <span>Copy Link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('star', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{doc.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('rename', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <Edit3 className="w-4 h-4 text-amber-400" />
                        <span>Rename</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('move', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer hover:bg-purple-400/20 focus:bg-purple-400/20"
                      >
                        <FolderInput className="w-4 h-4 text-indigo-400" />
                        <span>Move to Folder</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleAction('delete', doc.id); }}
                        className="flex items-center gap-3 cursor-pointer text-red-400 hover:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Share Modal */}
      {shareDocument && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setShareDocument(null);
          }}
          documentName={shareDocument.name}
          documentId={shareDocument.id}
        />
      )}
    </div>
  )
}