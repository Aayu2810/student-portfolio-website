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
        
        // Get user's storage info
        const { data: profile } = await supabase
          .from('profiles')
          .select('storage_used, storage_limit')
          .eq('id', user.id)
          .single();
        
        // Get documents count
        const { count: totalDocs } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Get verified documents count
        const { count: verifiedDocs } = await supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_public', true);
        
        // Get shared links count
        const { count: sharedLinks } = await supabase
          .from('shared_links')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Get recent uploads
        const { data: recentUploads } = await supabase
          .from('documents')
          .select('id, title, category, created_at, is_public')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        const newStats: DashboardStats = {
          totalDocuments: totalDocs || 0,
          verifiedDocuments: verifiedDocs || 0,
          sharedLinks: sharedLinks || 0,
          profileViews: 0,
          storageUsed: profile?.storage_used || 0,
          storageLimit: profile?.storage_limit || 0,
          recentUploads: recentUploads || []
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
          
          // Get user's storage info
          const { data: profile } = await supabase
            .from('profiles')
            .select('storage_used, storage_limit')
            .eq('id', user.id)
            .single();
          
          // Get documents count
          const { count: totalDocs } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          // Get verified documents count
          const { count: verifiedDocs } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_public', true);
          
          // Get shared links count
          const { count: sharedLinks } = await supabase
            .from('shared_links')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          
          // Get recent uploads
          const { data: recentUploads } = await supabase
            .from('documents')
            .select('id, title, category, created_at, is_public')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);
          
          const newStats: DashboardStats = {
            totalDocuments: totalDocs || 0,
            verifiedDocuments: verifiedDocs || 0,
            sharedLinks: sharedLinks || 0,
            profileViews: 0,
            storageUsed: profile?.storage_used || 0,
            storageLimit: profile?.storage_limit || 0,
            recentUploads: recentUploads || []
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
