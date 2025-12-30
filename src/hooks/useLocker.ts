// Locker Operations Hook with Optimized Caching
import { useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { useUser } from './useUser';
import { CACHE_CONFIG, CACHE_KEYS, createOptimizedFetcher, getMemoryCache, setMemoryCache } from '../lib/cache';
import useSWR from 'swr';
import { Document } from '../types';

export interface LockerFolder {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  document_count: number;
}

// Optimized locker documents fetcher
const lockerDocumentsFetcher = createOptimizedFetcher(
  'locker-documents',
  async (key: string, userId: string, folderId?: string) => {
    // Check memory cache first
    const cacheKey = folderId ? `locker-${userId}-${folderId}` : `locker-${userId}`;
    const memCache = getMemoryCache(cacheKey, CACHE_CONFIG.locker.staleTime);
    if (memCache) {
      console.log('Memory cache hit for locker documents');
      return memCache;
    }

    const supabase = createClient();
    
    let query = supabase
      .from('documents')
      .select('id, title, category, file_name, file_type, file_size, created_at, is_public, is_favorite, folder_id')
      .eq('user_id', userId);
    
    if (folderId && folderId !== 'all') {
      query = query.eq('folder_id', folderId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const result = data || [];
    setMemoryCache(cacheKey, result);
    
    return result;
  },
  CACHE_CONFIG.locker as any
);

// Optimized locker folders fetcher
const lockerFoldersFetcher = createOptimizedFetcher(
  'locker-folders',
  async (key: string, userId: string) => {
    // Check memory cache first
    const memCache = getMemoryCache(`folders-${userId}`, CACHE_CONFIG.locker.staleTime);
    if (memCache) {
      console.log('Memory cache hit for locker folders');
      return memCache;
    }

    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('folders')
      .select(`
        id,
        name,
        description,
        created_at,
        documents(count)
      `)
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    
    const folders: LockerFolder[] = (data || []).map((folder: any) => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      created_at: folder.created_at,
      document_count: folder.documents?.length || 0
    }));
    
    setMemoryCache(`folders-${userId}`, folders);
    
    return folders;
  },
  CACHE_CONFIG.locker as any
);

export function useLocker(folderId?: string) {
  const { user } = useUser();
  
  const { data: documents, error: docsError, mutate: mutateDocs } = useSWR<Document[]>(
    user?.id ? CACHE_KEYS.locker(user.id) : null,
    user?.id ? (key: string) => lockerDocumentsFetcher(key, user.id, folderId) : null,
    {
      ...CACHE_CONFIG.locker,
      onSuccess: (data) => {
        if (user?.id && data) {
          const cacheKey = folderId ? `locker-${user.id}-${folderId}` : `locker-${user.id}`;
          setMemoryCache(cacheKey, data);
        }
      },
      onError: (error) => {
        console.error('Locker documents fetch error:', error);
      }
    }
  );
  
  const { data: folders, error: foldersError, mutate: mutateFolders } = useSWR<LockerFolder[]>(
    user?.id ? `folders-${user.id}` : null,
    user?.id ? (key: string) => lockerFoldersFetcher(key, user.id) : null,
    {
      ...CACHE_CONFIG.locker,
      onSuccess: (data) => {
        if (user?.id && data) {
          setMemoryCache(`folders-${user.id}`, data);
        }
      },
      onError: (error) => {
        console.error('Locker folders fetch error:', error);
      }
    }
  );

  // Set up real-time subscriptions for locker updates
  useEffect(() => {
    if (!user?.id) return;
    
    const supabase = createClient();
    
    // Listen for document updates
    const documentChannel = supabase
      .channel('locker_document_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Locker document update:', payload);
          // Invalidate relevant caches
          if (user?.id) {
            setMemoryCache(`locker-${user.id}`, null);
            if (folderId) {
              setMemoryCache(`locker-${user.id}-${folderId}`, null);
            }
          }
          mutateDocs();
        }
      )
      .subscribe();
      
    // Listen for folder updates
    const folderChannel = supabase
      .channel('locker_folder_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'folders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Locker folder update:', payload);
          // Invalidate folder cache
          if (user?.id) {
            setMemoryCache(`folders-${user.id}`, null);
          }
          mutateFolders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(documentChannel);
      supabase.removeChannel(folderChannel);
    };
  }, [user?.id, folderId, mutateDocs, mutateFolders]);

  const createFolder = async (name: string, description?: string) => {
    const supabase = createClient();
    
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        description,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Invalidate cache and refetch
    if (user?.id) {
      setMemoryCache(`folders-${user.id}`, null);
    }
    mutateFolders();
    
    return data;
  };

  const moveToFolder = async (documentId: string, targetFolderId: string | null) => {
    const supabase = createClient();
    
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('documents')
      .update({ folder_id: targetFolderId })
      .eq('id', documentId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // Invalidate all relevant caches
    if (user?.id) {
      setMemoryCache(`locker-${user.id}`, null);
      setMemoryCache(`locker-${user.id}-${folderId}`, null);
    }
    mutateDocs();
  };

  return {
    documents: documents || [],
    folders: folders || [],
    loading: (!docsError && !documents && user !== undefined) || (!foldersError && !folders && user !== undefined),
    error: docsError ? docsError.message : (foldersError ? foldersError.message : null),
    refetchDocs: () => mutateDocs(),
    refetchFolders: () => mutateFolders(),
    createFolder,
    moveToFolder
  };
}
