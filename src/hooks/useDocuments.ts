import useSWR from 'swr'
import { getSupabaseClient } from '../lib/supabase/client'
import { Document } from '../types'
import { useUser } from './useUser'

// Use singleton client for consistent auth state
const supabase = getSupabaseClient()

// Fetcher for SWR
const fetchDocuments = async (userId: string): Promise<Document[]> => {
  console.log('[useDocuments] Fetching documents for user:', userId)
  const { data, error } = await supabase
    .from('documents')
    .select('id, user_id, title, description, category, tags, file_url, file_name, file_type, file_size, storage_path, thumbnail_url, is_favorite, is_public, views, downloads, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[useDocuments] Fetch error:', error)
    throw error
  }
  console.log('[useDocuments] Fetched', data?.length || 0, 'documents')
  return data || []
}

export function useDocuments() {
  const { user, profile, initialized } = useUser()

  // Only fetch documents when:
  // 1. User auth is initialized
  // 2. User exists
  // 3. Profile is loaded (ensures we have complete user context)
  const shouldFetch = initialized && !!user && !!profile

  // Use SWR for caching
  const { data: documents, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? ['documents', user.id] : null,
    () => fetchDocuments(user!.id),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      keepPreviousData: true,
      revalidateOnMount: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  const deleteDocument = async (documentId: string) => {
    console.log('[useDocuments] Deleting document:', documentId)
    const response = await fetch(`/api/locker/${documentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete document')
    }

    // Optimistic update
    mutate(
      (docs) => docs?.filter(doc => doc.id !== documentId),
      { revalidate: false }
    )
    console.log('[useDocuments] Document deleted successfully')
  }

  const updateDocument = async (documentId: string, updates: Partial<Document>) => {
    console.log('[useDocuments] Updating document:', documentId)
    const response = await fetch(`/api/locker/${documentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update document')
    }

    const { document: data } = await response.json()

    // Optimistic update
    mutate(
      (docs) => docs?.map(doc => doc.id === documentId ? { ...doc, ...data } : doc),
      { revalidate: false }
    )
    console.log('[useDocuments] Document updated successfully')
    return data
  }

  // Loading states:
  // - If user auth not initialized yet: loading
  // - If user exists but profile not loaded yet: loading
  // - If SWR is fetching and we have no cached data: loading
  const loading = !initialized || (!!user && !profile) || (isLoading && !documents)

  return {
    documents: documents || [],
    loading,
    isValidating,
    error: error?.message || null,
    deleteDocument,
    updateDocument,
    mutate
  }
}
