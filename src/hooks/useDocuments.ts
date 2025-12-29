import { useState, useEffect } from 'react'
import { CACHE_CONFIG, CACHE_KEYS, createOptimizedFetcher } from '../lib/cache';
import { createClient } from '../lib/supabase/client'
import { Document } from '../types'
import useSWR from 'swr'
import { useUser } from './useUser'

// Ultra-fast document fetcher with aggressive caching
const documentFetcher = createOptimizedFetcher(
  'documents',
  async (key: string, userId: string) => {
  const supabase = createClient()
  
  if (!userId) {
    throw new Error('Not authenticated')
  }

  // Query only the fields that actually exist in the database
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
)

export function useDocuments() {
  const { user } = useUser()
  
  // Clear cache on mount to ensure fresh data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('documents-'))
      keys.forEach(key => localStorage.removeItem(key))
    }
  }, [])
  
  const { data, error, mutate } = useSWR<Document[] | null>(
    user?.id ? CACHE_KEYS.documents(user.id) : null,
    user?.id ? (key: string) => documentFetcher(key, user.id) : null,
    CACHE_CONFIG.documents
  )

  // Optimized delete function with immediate cache invalidation
  const deleteDocument = async (documentId: string) => {
    const supabase = createClient()
    const { user } = useUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    try {
      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        
        if (error) throw error
        
        // Invalidate cache immediately
        mutate([], {
          revalidate: true,
          populateCache: false,
          rollbackOnError: true,
          optimisticData: [],
          throwOnError: false,
        });
    } catch (err: any) {
      console.error('Delete error:', err);
      throw err
    }
  }

  // Optimized update function with cache invalidation
  const updateDocument = async (documentId: string, updates: Partial<Document>) => {
    const supabase = createClient()
    const { user } = useUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    try {
      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        
        if (error) throw error
        
        // Invalidate cache to trigger refetch
        mutate([], {
          revalidate: true,
          populateCache: false,
          rollbackOnError: true,
          optimisticData: [],
          throwOnError: false,
        });
    } catch (err: any) {
      console.error('Update error:', err);
      throw err
    }
  }

  return {
    documents: data || [],
    loading: !error && !data && user !== undefined,
    error: error ? error.message : null,
    refetch: () => mutate(),
    deleteDocument,
    updateDocument
  }
}