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
      dedupingInterval: 5000, // Dedupe within 5s
    }
  )

  const deleteDocument = async (documentId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user?.id)

    if (error) throw error
    
    setDoc{ error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user?.id)

    if (error) throw error
    
    // Optimistic update - remove from cache immediately
    mutate(
      (docs) => docs?.filter(doc => doc.id !== documentId),
      { revalidate: false }
    )
  }

  const updateDocument = async (documentId: string, updates: Partial<Document>) => {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .eq('user_id', user?.id)
      .select()
      .single()

    if (error) throw error
    
    // Optimistic update - update cache immediately
    mutate(
      (docs) => docs?.map(doc => doc.id === documentId ? { ...doc, ...data } : doc),
      { revalidate: false }
    )
    
    return data
  }

  return {
    documents: documents || [],
    loading: isLoading,
    error: error?.message || null