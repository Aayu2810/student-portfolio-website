'use client';

import { useState, useEffect } from 'react';
import { ActivityTimeline } from '@/components/audit/ActivityTimeline';
import { Shield, Activity, Clock, Users, TrendingUp, Eye, CheckCircle, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

interface Stats {
  totalActivities: number;
  recentViews: number;
  verifications: number;
  activeUsers: number;
}

export default function AuditLogsPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<Stats>({
    totalActivities: 0,
    recentViews: 0,
    verifications: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Total activities (last 30 days) - filter by current user
      const { count: totalActivities } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('accessed_by', user.id)
        .gte('accessed_at', thirtyDaysAgo.toISOString());

      // Recent views (last 7 days) - filter by current user
      const { count: recentViews } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('accessed_by', user.id)
        .eq('action', 'view')
        .gte('accessed_at', sevenDaysAgo.toISOString());

      // Verifications (this month) - filter by current user
      const { count: verifications } = await supabase
        .from('verifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      // Document count (today) - filter by current user
      const { count: documentCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      setStats({
        totalActivities: totalActivities || 0,
        recentViews: recentViews || 0,
        verifications: verifications || 0,
        activeUsers: documentCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    fetchStats();

    // Set up real-time subscriptions for stats updates - refresh on any change
    const accessLogsSubscription = supabase
      .channel('stats_access_logs')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'access_logs' 
        }, 
        (payload: any) => {
          console.log('Stats: Access log change detected:', payload);
          // Always refresh - the query will filter by user ID
          fetchStats();
        }
      )
      .subscribe();

    const verificationsSubscription = supabase
      .channel('stats_verifications')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verifications'
        },
        (payload: any) => {
          console.log('Stats: Verification change detected:', payload);
          // Always refresh - the query will filter by user ID
          fetchStats();
        }
      )
      .subscribe();

    const documentsSubscription = supabase
      .channel('stats_documents')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload: any) => {
          console.log('Stats: Document change detected:', payload);
          // Always refresh - the query will filter by user ID
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      accessLogsSubscription.unsubscribe();
      verificationsSubscription.unsubscribe();
      documentsSubscription.unsubscribe();
    };
  }, [user]);

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    bgColor 
  }: { 
    title: string; 
    value: number; 
    subtitle: string; 
    icon: any; 
    color: string; 
    bgColor: string; 
  }) => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="text-lg font-medium text-white">{title}</h3>
      </div>
      <p className={`text-3xl font-bold ${color}`}>
        {loading ? (
          <div className="animate-pulse bg-gray-600 h-8 w-16 rounded"></div>
        ) : (
          value.toLocaleString()
        )}
      </p>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            My Activity Logs
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time monitoring of your document activities and security events
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Activities"
            value={stats.totalActivities}
            subtitle="Last 30 days"
            icon={Activity}
            color="text-purple-400"
            bgColor="bg-purple-500/10"
          />
          
          <StatCard
            title="Recent Views"
            value={stats.recentViews}
            subtitle="Last 7 days"
            icon={Eye}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
          />
          
          <StatCard
            title="Verifications"
            value={stats.verifications}
            subtitle="This month"
            icon={CheckCircle}
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
          />
          
          <StatCard
            title="Documents Today"
            value={stats.activeUsers}
            subtitle="Uploaded today"
            icon={Upload}
            color="text-cyan-400"
            bgColor="bg-cyan-500/10"
          />
        </div>

        {/* Activity Timeline */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-semibold text-white">Activity Timeline</h2>
            <div className="text-sm text-gray-400">Live</div>
          </div>
          
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
