import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { Document } from '../types'
import { useUser } from './useUser'

export function useDocuments() {
  const { user } = useUser()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) {
        setDocuments([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('documents')
          .select('id, user_id, title, description, category, tags, file_url, file_name, file_type, file_size, storage_path, thumbnail_url, is_favorite, is_public, views, downloads, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setDocuments(data || [])
      } catch (err: any) {
        console.error('Error fetching documents:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [user])

  const deleteDocument = async (documentId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user?.id)

    if (error) throw error
    
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const updateDocument = async (documentId: string, updates: Partial<Document>) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .eq('user_id', user?.id)
      .select()
      .single()

    if (error) throw error
    
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, ...data } : doc
    ))
    
    return data
  }

  const mutate = () => {
    if (user) {
      const fetchDocuments = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from('documents')
          .select('id, user_id, title, description, category, tags, file_url, file_name, file_type, file_size, storage_path, thumbnail_url, is_favorite, is_public, views, downloads, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setDocuments(data || [])
      }
      fetchDocuments()
    }
  }

  return {
    documents,
    loading,
    error,
    deleteDocument,
    updateDocument,
    mutate
  }
}
