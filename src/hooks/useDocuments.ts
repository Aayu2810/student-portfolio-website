import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { Document } from '../types'

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setDocuments(data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId)
      if (!document) return

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (dbError) throw dbError

      // Update storage usage
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('storage_used')
          .eq('id', user.id)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({ 
              storage_used: Math.max(0, profile.storage_used - document.file_size)
            })
            .eq('id', user.id)
        }
      }

      // Refresh documents
      await fetchDocuments()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateDocument = async (documentId: string, updates: Partial<Document>) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)

      if (error) throw error

      await fetchDocuments()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    deleteDocument,
    updateDocument
  }
}