import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { createClient } from '../lib/supabase/client';
import { useUser } from './useUser';

export interface DashboardStats {
  totalDocuments: number;
  verifiedDocuments: number;
  sharedLinks: number;
  profileViews: number;
  storageUsed: number;
  storageLimit: number;
  recentUploads: any[];
}

const supabase = createClient();

// Fetcher function for SWR - runs parallel queries for speed
const fetchDashboardStats = async (userId: string): Promise<DashboardStats> => {
  // Run all queries in parallel for faster loading!
  const [
    profileResult,
    totalDocsResult,
    verifiedDocsResult,
    sharedLinksResult,
    recentUploadsResult
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('storage_used, storage_limit')
      .eq('id', userId)
      .single(),
    
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    
    supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_public', true),
    
    supabase
      .from('shared_links')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    
    supabase
      .from('documents')
      .select('id, title, category, created_at, is_public')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  if (profileResult.error) throw profileResult.error;
  if (totalDocsResult.error) throw totalDocsResult.error;
  if (verifiedDocsResult.error) throw verifiedDocsResult.error;
  if (sharedLinksResult.error) throw sharedLinksResult.error;
  if (recentUploadsResult.error) throw recentUploadsResult.error;

  return {
    totalDocuments: totalDocsResult.count || 0,
    verifiedDocuments: verifiedDocsResult.count || 0,
    sharedLinks: sharedLinksResult.count || 0,
    profileViews: 0,
    storageUsed: profileResult.data?.storage_used || 0,
    storageLimit: profileResult.data?.storage_limit || 0,
    recentUploads: recentUploadsResult.data || []
  };
};

export function useDashboardStats() {
  const { user } = useUser();
  
  // Use SWR for caching and automatic revalidation
  const { data: stats, error, isLoading, mutate } = useSWR(
    user ? ['dashboard-stats', user.id] : null,
    () => fetchDashboardStats(user!.id),
    {
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: true, // Refetch on reconnect
      dedupingInterval: 10000, // Dedupe requests within 10s
      refreshInterval: 60000, // Auto refresh every 60s
    }
  );

  const defaultStats: DashboardStats = {
    totalDocuments: 0,
    verifiedDocuments: 0,
    sharedLinks: 0,
    profileViews: 0,
    storageUsed: 0,
    storageLimit: 0,
    recentUploads: []
  };

  return {
    stats: stats || defaultStats,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate
  };
}
