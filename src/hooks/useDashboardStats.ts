import { useState, useEffect } from 'react';
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

export function useDashboardStats() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    verifiedDocuments: 0,
    sharedLinks: 0,
    profileViews: 0,
    storageUsed: 0,
    storageLimit: 0,
    recentUploads: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Run all queries in parallel for faster loading!
        const [
          profileResult,
          totalDocsResult,
          verifiedDocsResult,
          sharedLinksResult,
          recentUploadsResult
        ] = await Promise.all([
          // Get user's storage info
          supabase
            .from('profiles')
            .select('storage_used, storage_limit')
            .eq('id', user.id)
            .single(),
          
          // Get documents count
          supabase
            .from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          
          // Get verified documents count
          supabase
            .from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_public', true),
          
          // Get shared links count
          supabase
            .from('shared_links')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          
          // Get recent uploads
          supabase
            .from('documents')
            .select('id, title, category, created_at, is_public')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);
        
        const newStats: DashboardStats = {
          totalDocuments: totalDocsResult.count || 0,
          verifiedDocuments: verifiedDocsResult.count || 0,
          sharedLinks: sharedLinksResult.count || 0,
          profileViews: 0,
          storageUsed: profileResult.data?.storage_used || 0,
          storageLimit: profileResult.data?.storage_limit || 0,
          recentUploads: recentUploadsResult.data || []
        };
        
        setStats(newStats);
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const refetch = () => {
    if (user) {
      setLoading(true);
      const fetchStats = async () => {
        try {
          setError(null);
          
          // Run all queries in parallel
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
              .eq('id', user.id)
              .single(),
            
            supabase
              .from('documents')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id),
            
            supabase
              .from('documents')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('is_public', true),
            
            supabase
              .from('shared_links')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id),
            
            supabase
              .from('documents')
              .select('id, title, category, created_at, is_public')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(5)
          ]);
          
          const newStats: DashboardStats = {
            totalDocuments: totalDocsResult.count || 0,
            verifiedDocuments: verifiedDocsResult.count || 0,
            sharedLinks: sharedLinksResult.count || 0,
            profileViews: 0,
            storageUsed: profileResult.data?.storage_used || 0,
            storageLimit: profileResult.data?.storage_limit || 0,
            recentUploads: recentUploadsResult.data || []
          };
          
          setStats(newStats);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }
  };

  return {
    stats,
    loading,
    error,
    refetch
  };
}
