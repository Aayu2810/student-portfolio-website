// Verification Logic Hook with Optimized Caching
import { useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { useUser } from './useUser';
import { CACHE_CONFIG, CACHE_KEYS, createOptimizedFetcher, getMemoryCache, setMemoryCache } from '../lib/cache';
import useSWR from 'swr';

export interface VerificationDocument {
  id: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  documentName: string;
  documentType: string;
  uploadedAt: string;
  status: 'pending' | 'in-review' | 'verified' | 'rejected';
  rejectionReason?: string;
  userId: string;
  file_url?: string;
  storage_path?: string;
}

// Optimized verification fetcher with caching
const verificationFetcher = createOptimizedFetcher(
  'verification',
  async (key: string, userId: string, userRole: string) => {
    // Check memory cache first
    const memCache = getMemoryCache(`verification-${userId}-${userRole}`, CACHE_CONFIG.verification.staleTime);
    if (memCache) {
      console.log('Memory cache hit for verification');
      return memCache;
    }

    const supabase = createClient();
    
    let query;
    if (userRole === 'faculty' || userRole === 'admin') {
      // Faculty/Admin: fetch all documents that need verification
      query = supabase
        .from('documents')
        .select(`
          id, 
          title, 
          category, 
          created_at, 
          is_public, 
          file_url, 
          storage_path, 
          user_id,
          profiles(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });
    } else {
      // Regular user: fetch only their own documents
      query = supabase
        .from('documents')
        .select('id, title, category, created_at, is_public, file_url, storage_path, user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    }

    const { data: docsData, error: docsError } = await query;

    if (docsError) {
      throw new Error(docsError.message);
    }

    if (!docsData || docsData.length === 0) {
      return [];
    }
    
    // Fetch verification status for all documents
    const docIds = docsData.map(doc => doc.id);
    const { data: verificationData, error: verificationError } = await supabase
      .from('verifications')
      .select('document_id, status, rejection_reason')
      .in('document_id', docIds);
    
    if (verificationError) {
      console.error('Error fetching verifications:', verificationError);
    }
    
    const verificationMap = verificationData ? 
      verificationData.reduce((acc: Record<string, any>, v) => {
        acc[v.document_id] = v;
        return acc;
      }, {}) : {};
    
    // Transform the data with proper status handling
    const transformedData = docsData.map((doc: any) => {
      const verification = verificationMap[doc.id];
      
      // Determine status from verifications table or fallback to is_public
      let status: 'pending' | 'in-review' | 'verified' | 'rejected' = 'pending';
      let rejectionReason = undefined;
      
      if (verification && verification.status) {
        status = verification.status as 'pending' | 'in-review' | 'verified' | 'rejected';
        if (verification.rejection_reason) {
          rejectionReason = verification.rejection_reason;
        }
      } else {
        // Fallback to is_public field
        status = doc.is_public ? 'verified' as const : 'pending' as const;
      }
      
      return {
        id: doc.id,
        studentName: userRole === 'faculty' || userRole === 'admin' 
          ? `${doc.profiles?.[0]?.first_name || 'User'} ${doc.profiles?.[0]?.last_name || ''}`.trim() || 'User'
          : 'Current User',
        studentEmail: userRole === 'faculty' || userRole === 'admin' 
          ? doc.profiles?.[0]?.email || 'N/A'
          : 'N/A',
        studentDepartment: 'N/A',
        documentName: doc.title,
        documentType: doc.category,
        uploadedAt: doc.created_at,
        status: status,
        rejectionReason: rejectionReason,
        userId: doc.user_id,
        file_url: doc.file_url,
        storage_path: doc.storage_path
      };
    });
    
    // Store in memory cache
    setMemoryCache(`verification-${userId}-${userRole}`, transformedData);
    
    return transformedData;
  },
  CACHE_CONFIG.verification as any
);

export function useVerification() {
  const { user, profile } = useUser();
  
  const { data, error, mutate } = useSWR<VerificationDocument[]>(
    user?.id && profile?.role ? CACHE_KEYS.verification() : null,
    user?.id && profile?.role ? (key: string) => verificationFetcher(key, user.id, profile.role) : null,
    {
      ...CACHE_CONFIG.verification,
      onSuccess: (data) => {
        // Update memory cache on successful fetch
        if (user?.id && profile?.role && data) {
          setMemoryCache(`verification-${user.id}-${profile.role}`, data);
        }
      },
      onError: (error) => {
        console.error('Verification fetch error:', error);
      }
    }
  );

  // Set up real-time subscription for verification updates
  useEffect(() => {
    if (!user || !profile?.role) return;
    
    const supabase = createClient();
    
    // Listen for document updates
    const documentChannel = supabase
      .channel('document_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: profile.role === 'faculty' || profile.role === 'admin' ? 'id=neq.null' : `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Document updated:', payload);
          // Invalidate memory cache and refetch
          if (user?.id && profile?.role) {
            setMemoryCache(`verification-${user.id}-${profile.role}`, null);
          }
          mutate();
        }
      )
      .subscribe();
      
    // Listen for verification updates
    const verificationChannel = supabase
      .channel('verification_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'verifications',
          filter: profile.role === 'faculty' || profile.role === 'admin' ? 'document_id=neq.null' : `document_id.in.(select id from documents where user_id=eq.${user.id})`
        },
        (payload) => {
          console.log('Verification status updated:', payload);
          // Invalidate memory cache and refetch
          if (user?.id && profile?.role) {
            setMemoryCache(`verification-${user.id}-${profile.role}`, null);
          }
          mutate();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'verifications',
          filter: profile.role === 'faculty' || profile.role === 'admin' ? 'document_id=neq.null' : `document_id.in.(select id from documents where user_id=eq.${user.id})`
        },
        (payload) => {
          console.log('Verification status updated:', payload);
          // Invalidate memory cache and refetch
          if (user?.id && profile?.role) {
            setMemoryCache(`verification-${user.id}-${profile.role}`, null);
          }
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(documentChannel);
      supabase.removeChannel(verificationChannel);
    };
  }, [user, profile?.role, mutate]);

  return {
    documents: data || [],
    loading: !error && !data && user !== undefined,
    error: error ? error.message : null,
    refetch: () => mutate()
  };
}
