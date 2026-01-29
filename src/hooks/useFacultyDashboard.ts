// Faculty Dashboard Hook with Optimized Caching
import { useEffect } from 'react';
import { createClient } from '../lib/supabase/client';
import { useUser } from './useUser';
import { CACHE_CONFIG, CACHE_KEYS, createOptimizedFetcher, getMemoryCache, setMemoryCache } from '../lib/cache';
import useSWR from 'swr';

export interface FacultyStats {
  totalDocuments: number;
  pendingVerifications: number;
  verifiedDocuments: number;
  rejectedDocuments: number;
  totalStudents: number;
  recentActivity: any[];
}

export interface FacultyDocument {
  id: string;
  title: string;
  category: string;
  studentName: string;
  studentEmail: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
}

// Optimized faculty stats fetcher
const facultyStatsFetcher = createOptimizedFetcher(
  'faculty-stats',
  async (key: string) => {
    // Check memory cache first
    const memCache = getMemoryCache('faculty-stats', CACHE_CONFIG.faculty.staleTime);
    if (memCache) {
      console.log('Memory cache hit for faculty stats');
      return memCache;
    }

    const supabase = createClient();
    
    // Get total documents count
    const { count: totalDocs } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    // Get verification counts
    const { data: verifications } = await supabase
      .from('verifications')
      .select('status');
    
    const pendingCount = verifications?.filter(v => v.status === 'pending').length || 0;
    const verifiedCount = verifications?.filter(v => v.status === 'approved').length || 0;
    const rejectedCount = verifications?.filter(v => v.status === 'rejected').length || 0;
    
    // Get total students
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    
    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('verification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const stats: FacultyStats = {
      totalDocuments: totalDocs || 0,
      pendingVerifications: pendingCount,
      verifiedDocuments: verifiedCount,
      rejectedDocuments: rejectedCount,
      totalStudents: totalStudents || 0,
      recentActivity: recentActivity || []
    };
    
    // Store in memory cache
    setMemoryCache('faculty-stats', stats);
    
    return stats;
  },
  CACHE_CONFIG.faculty as any
);

// Optimized faculty documents fetcher
const facultyDocumentsFetcher = createOptimizedFetcher(
  'faculty-documents',
  async (key: string) => {
    // Check memory cache first
    const memCache = getMemoryCache('faculty-documents', CACHE_CONFIG.faculty.staleTime);
    if (memCache) {
      console.log('Memory cache hit for faculty documents');
      return memCache;
    }

    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        category,
        created_at,
        user_id,
        profiles(first_name, last_name, email),
        verifications(status, rejection_reason)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const documents: FacultyDocument[] = (data || []).map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      studentName: `${doc.profiles?.first_name || ''} ${doc.profiles?.last_name || ''}`.trim(),
      studentEmail: doc.profiles?.email || '',
      uploadedAt: doc.created_at,
      status: doc.verifications?.[0]?.status || 'pending',
      rejectionReason: doc.verifications?.[0]?.rejection_reason
    }));
    
    // Store in memory cache
    setMemoryCache('faculty-documents', documents);
    
    return documents;
  },
  CACHE_CONFIG.faculty as any
);

export function useFacultyDashboard() {
  const { user, profile } = useUser();
  
  // Only fetch if user is faculty or admin
  const isEnabled = user && (profile?.role === 'faculty' || profile?.role === 'admin');
  
  const { data: stats, error: statsError, mutate: mutateStats } = useSWR<FacultyStats>(
    isEnabled ? CACHE_KEYS.facultyStats() : null,
    isEnabled ? facultyStatsFetcher : null,
    {
      ...CACHE_CONFIG.faculty,
      onSuccess: (data) => {
        if (data) {
          setMemoryCache('faculty-stats', data);
        }
      },
      onError: (error) => {
        console.error('Faculty stats fetch error:', error);
      }
    }
  );
  
  const { data: documents, error: docsError, mutate: mutateDocs } = useSWR<FacultyDocument[]>(
    isEnabled ? CACHE_KEYS.faculty() : null,
    isEnabled ? facultyDocumentsFetcher : null,
    {
      ...CACHE_CONFIG.faculty,
      onSuccess: (data) => {
        if (data) {
          setMemoryCache('faculty-documents', data);
        }
      },
      onError: (error) => {
        console.error('Faculty documents fetch error:', error);
      }
    }
  );

  // Set up real-time subscriptions for faculty
  useEffect(() => {
    if (!isEnabled) return;
    
    const supabase = createClient();
    
    // Listen for verification updates
    const verificationChannel = supabase
      .channel('faculty_verification_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verifications'
        },
        (payload) => {
          console.log('Faculty verification update:', payload);
          // Invalidate caches and refetch
          setMemoryCache('faculty-stats', null);
          setMemoryCache('faculty-documents', null);
          mutateStats();
          mutateDocs();
        }
      )
      .subscribe();
      
    // Listen for document updates
    const documentChannel = supabase
      .channel('faculty_document_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('Faculty document update:', payload);
          // Invalidate caches and refetch
          setMemoryCache('faculty-stats', null);
          setMemoryCache('faculty-documents', null);
          mutateStats();
          mutateDocs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(verificationChannel);
      supabase.removeChannel(documentChannel);
    };
  }, [isEnabled, mutateStats, mutateDocs]);

  return {
    stats: stats || {
      totalDocuments: 0,
      pendingVerifications: 0,
      verifiedDocuments: 0,
      rejectedDocuments: 0,
      totalStudents: 0,
      recentActivity: []
    },
    documents: documents || [],
    loading: (!statsError && !stats && isEnabled) || (!docsError && !documents && isEnabled),
    statsError: statsError ? statsError.message : null,
    docsError: docsError ? docsError.message : null,
    refetchStats: () => mutateStats(),
    refetchDocs: () => mutateDocs(),
    isEnabled
  };
}
