import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '../lib/supabase/client'
import { Document } from '../types'
import { useUser } from './useUser'

const supabase = createClient()

// Fetcher for SWR
const fetchDocuments = async (userId: string): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('id, user_id, title, description, category, tags, file_url, file_name, file_type, file_size, storage_path, thumbnail_url, is_favorite, is_public, views, downloads, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export function useDocuments() {
  const { user } = useUser()
  
  // Use SWR for caching
  const { data: documents, error, isLoading, mutate } = useSWR(
    user ? ['documents', user.id] : null,
    () => fetchDocuments(user!.id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true, // Keep showing old data while fetching
      revalidateOnMount: true, // Always fetch on mount
    }
  )

  const deleteDocument = async (documentId: string) => {
    try {
      // Use the API endpoint which handles both storage and database cleanup
      const response = await fetch(`/api/locker/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete document')
      }
      
      // Optimistic update - remove from cache immediately
      mutate(
        (docs) => docs?.filter(doc => doc.id !== documentId),
        { revalidate: false }
      )
    } catch (error) {
      console.error('Error deleting document:', error)
      throw error
    }
  }

  const updateDocument = async (documentId: string, updates: Partial<Document>) => {
    try {
      // Use the API endpoint for consistency
      const response = await fetch(`/api/locker/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update document')
      }

      const { document: data } = await response.json()
      
      // Optimistic update - update cache immediately
      mutate(
        (docs) => docs?.map(doc => doc.id === documentId ? { ...doc, ...data } : doc),
        { revalidate: false }
      )
      
      return data
    } catch (error) {
      console.error('Error updating document:', error)
      throw error
    }
  }

  return {
    documents: documents || [],
    loading: isLoading,
    error: error?.message || null,
    deleteDocument,
    updateDocument,
    mutate
  }
}