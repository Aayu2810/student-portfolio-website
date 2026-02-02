import useSWR from 'swr'
import { getSupabaseClient } from '../lib/supabase/client'
import { useUser } from './useUser'

export interface DashboardStats {
  totalDocuments: number
  verifiedDocuments: number
  sharedLinks: number
  profileViews: number
  storageUsed: number
  storageLimit: number
  recentUploads: any[]
}

// Use singleton client for consistent auth state
const supabase = getSupabaseClient()

const defaultStats: DashboardStats = {
  totalDocuments: 0,
  verifiedDocuments: 0,
  sharedLinks: 0,
  profileViews: 0,
  storageUsed: 0,
  storageLimit: 0,
  recentUploads: []
}

// Fetcher function for SWR - runs parallel queries for speed
const fetchDashboardStats = async (userId: string): Promise<DashboardStats> => {
  console.log('[useDashboardStats] Fetching stats for user:', userId)

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
  ])

  if (profileResult.error) throw profileResult.error
  if (totalDocsResult.error) throw totalDocsResult.error
  if (verifiedDocsResult.error) throw verifiedDocsResult.error
  if (sharedLinksResult.error) throw sharedLinksResult.error
  if (recentUploadsResult.error) throw recentUploadsResult.error

  const profileData = profileResult.data as { storage_used: number; storage_limit: number } | null
  const stats = {
    totalDocuments: totalDocsResult.count || 0,
    verifiedDocuments: verifiedDocsResult.count || 0,
    sharedLinks: sharedLinksResult.count || 0,
    profileViews: 0,
    storageUsed: profileData?.storage_used || 0,
    storageLimit: profileData?.storage_limit || 0,
    recentUploads: recentUploadsResult.data || []
  }

  console.log('[useDashboardStats] Stats fetched')
  return stats
}

export function useDashboardStats() {
  const { user, profile, initialized } = useUser()

  // Only fetch stats when user is fully loaded with profile
  const shouldFetch = initialized && !!user && !!profile

  const { data: stats, error, isLoading, isValidating, mutate } = useSWR(
    shouldFetch ? ['dashboard-stats', user.id] : null,
    () => fetchDashboardStats(user!.id),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      refreshInterval: 0,
      keepPreviousData: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  // Loading states:
  // - If user auth not initialized: loading
  // - If user exists but profile not loaded: loading
  // - If SWR is fetching with no cached data: loading
  const loading = !initialized || (!!user && !profile) || (isLoading && !stats)

  return {
    stats: stats || defaultStats,
    loading,
    isValidating,
    error: error?.message || null,
    refetch: mutate
  }
}
