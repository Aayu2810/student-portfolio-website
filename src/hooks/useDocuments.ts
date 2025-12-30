import { useState, useEffect } from 'react'
import { CACHE_CONFIG, CACHE_KEYS, createOptimizedFetcher, clearUserCache, getMemoryCache, setMemoryCache } from '../lib/cache';
import { createClient } from '../lib/supabase/client'
import { Document } from '../types'
import useSWR from 'swr'
import { useUser } from './useUser'

// Ultra-fast document fetcher with multi-layer caching
const documentFetcher = createOptimizedFetcher(
  'documents',
  async (key: string, userId: string) => {
    // Check memory cache first for ultra-fast access
    const memCache = getMemoryCache(`documents-${userId}`, CACHE_CONFIG.documents.staleTime);
    if (memCache) {
      console.log('Memory cache hit for documents');
      return memCache;
    }

    const supabase = createClient()
    
    if (!userId) {
      throw new Error('Not authenticated')
    }

    // Optimized query with specific fields for performance
    const { data, error } = await supabase
      .from('documents')
      .select('id, user_id, title, description, category, tags, file_url, file_name, file_type, file_size, storage_path, thumbnail_url, is_favorite, is_public, views, downloads, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    const result = data || [];
    
    // Store in memory cache for instant access
    setMemoryCache(`documents-${userId}`, result);
    
    return result;
  },
  CACHE_CONFIG.documents
)

export function useDocuments() {
  const { user } = useUser()
  
  // Clear stale cache on mount for fresh data
  useEffect(() => {
    if (user?.id) {
      // Only clear very old cache, not recent data
      clearUserCache(user.id);
    }
  }, [user?.id])
  
  const { data, error, mutate } = useSWR<Document[] | null>(
    user?.id ? CACHE_KEYS.documents(user.id) : null,
    user?.id ? (key: string) => documentFetcher(key, user.id) : null,
    {
      ...CACHE_CONFIG.documents,
      onSuccess: (data) => {
        // Update memory cache on successful fetch
        if (user?.id && data) {
          setMemoryCache(`documents-${user.id}`, data);
        }
      },
      onError: (error) => {
        console.error('Documents fetch error:', error);
      }
    }
  )

  // Optimized delete function with smart cache invalidation
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
        
        // Optimistic update - remove from cache immediately
        const currentData = data || [];
        const optimisticData = currentData.filter(doc => doc.id !== documentId);
        
        // Update all cache layers
        mutate(optimisticData, {
          revalidate: false,
          populateCache: true,
          rollbackOnError: true,
          optimisticData,
        });
        
        // Clear memory cache
        if (user?.id) {
          setMemoryCache(`documents-${user.id}`, optimisticData);
        }
        
        // Revalidate after a short delay to ensure consistency
        setTimeout(() => mutate(), 500);
        
    } catch (err: any) {
      console.error('Delete error:', err);
      // Revert optimistic update on error
      mutate();
      throw err
    }
  }

  // Optimized update function with smart cache invalidation
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
        
        // Optimistic update - update cache immediately
        const currentData = data || [];
        const optimisticData = currentData.map(doc => 
          doc.id === documentId ? { ...doc, ...updates, updated_at: new Date().toISOString() } : doc
        );
        
        // Update all cache layers
        mutate(optimisticData, {
          revalidate: false,
          populateCache: true,
          rollbackOnError: true,
          optimisticData,
        });
        
        // Clear memory cache
        if (user?.id) {
          setMemoryCache(`documents-${user.id}`, optimisticData);
        }
        
        // Revalidate after a short delay to ensure consistency
        setTimeout(() => mutate(), 500);
        
    } catch (err: any) {
      console.error('Update error:', err);
      // Revert optimistic update on error
      mutate();
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