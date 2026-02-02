'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { 
  CheckCircle, 
  Eye, 
  Download, 
  Share2, 
  Upload, 
  Trash2, 
  Shield,
  MapPin,
  Clock,
  Link,
  FileText
} from 'lucide-react';

interface ActivityItem {
  id: string;
  action: 'view' | 'download' | 'share' | 'upload' | 'delete' | 'verify';
  documentName: string;
  documentId: string;
  accessedBy?: string;
  ipAddress?: string;
  location?: string;
  shareToken?: string;
  accessedAt: string;
  metadata?: Record<string, any>;
}

const activityConfig = {
  view: {
    icon: Eye,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    glowColor: 'hover:shadow-blue-500/20',
    label: 'Viewed'
  },
  download: {
    icon: Download,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    glowColor: 'hover:shadow-cyan-500/20',
    label: 'Downloaded'
  },
  share: {
    icon: Share2,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    glowColor: 'hover:shadow-purple-500/20',
    label: 'Shared'
  },
  upload: {
    icon: Upload,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    glowColor: 'hover:shadow-green-500/20',
    label: 'Uploaded'
  },
  delete: {
    icon: Trash2,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    glowColor: 'hover:shadow-red-500/20',
    label: 'Deleted'
  },
  verify: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    glowColor: 'hover:shadow-emerald-500/20',
    label: 'Verified'
  }
};

export function ActivityTimeline() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const supabase = createClient();

  const fetchActivities = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch from access_logs table - filter by current user
      const { data: accessLogs, error: accessError } = await supabase
        .from('access_logs')
        .select(`
          id,
          action,
          document_id,
          accessed_by,
          share_token,
          ip_address,
          user_agent,
          accessed_at,
          documents!inner(title)
        `)
        .eq('accessed_by', user.id) // Filter by current user
        .order('accessed_at', { ascending: false })
        .limit(20);

      if (accessError) {
        console.error('Error fetching access logs:', accessError);
      }

      // Fetch verification logs - filter by current user
      const { data: verificationLogs, error: verificationError } = await supabase
        .from('verifications')
        .select(`
          id,
          status,
          document_id,
          verifier_id,
          created_at,
          updated_at,
          documents!inner(title),
          profiles!inner(first_name, last_name)
        `)
        .eq('user_id', user.id) // Filter by current user
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch document uploads - filter by current user
      const { data: documentUploads, error: documentsError } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          user_id,
          created_at,
          updated_at,
          category
        `)
        .eq('user_id', user.id) // Filter by current user
        .order('created_at', { ascending: false })
        .limit(20);

      if (documentsError) {
        console.error('Error fetching document uploads:', documentsError);
      }

      // Transform and combine data
      const transformedActivities: ActivityItem[] = [];

      // Process access logs
      if (accessLogs) {
        accessLogs.forEach((log: any) => {
          transformedActivities.push({
            id: log.id,
            action: log.action,
            documentName: log.documents?.title || 'Unknown Document',
            documentId: log.document_id,
            accessedBy: log.accessed_by,
            ipAddress: log.ip_address,
            shareToken: log.share_token,
            accessedAt: log.accessed_at,
            metadata: {
              userAgent: log.user_agent
            }
          });
        });
      }

      // Process document uploads
      if (documentUploads) {
        documentUploads.forEach((doc: any) => {
          transformedActivities.push({
            id: `upload-${doc.id}`,
            action: 'upload',
            documentName: doc.title || 'Unknown Document',
            documentId: doc.id,
            accessedBy: doc.user_id,
            accessedAt: doc.created_at,
            metadata: {
              category: doc.category,
              updated_at: doc.updated_at
            }
          });
        });
      }

      // Process verification logs
      if (verificationLogs) {
        verificationLogs.forEach((log: any) => {
          transformedActivities.push({
            id: log.id,
            action: 'verify',
            documentName: log.documents?.title || 'Unknown Document',
            documentId: log.document_id,
            accessedBy: log.verifier_id,
            accessedAt: log.created_at,
            metadata: {
              status: log.status,
              verifierName: log.profiles ? 
                `${log.profiles.first_name} ${log.profiles.last_name}` : 
                'Unknown Verifier',
              updated_at: log.updated_at
            }
          });
        });
      }

      // Sort by accessed_at
      transformedActivities.sort((a, b) => 
        new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime()
      );

      setActivities(transformedActivities);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Initial fetch
    fetchActivities();

    // Set up real-time subscriptions - refresh on any change to these tables
    const accessLogsSubscription = supabase
      .channel('access_logs_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'access_logs' 
        }, 
        (payload: any) => {
          console.log('Access log change detected:', payload);
          // Always refresh - the query will filter by user ID
          fetchActivities();
        }
      )
      .subscribe();

    const verificationsSubscription = supabase
      .channel('verifications_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verifications'
        },
        (payload: any) => {
          console.log('Verification change detected:', payload);
          // Always refresh - the query will filter by user ID
          fetchActivities();
        }
      )
      .subscribe();

    const documentsSubscription = supabase
      .channel('documents_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload: any) => {
          console.log('Document change detected:', payload);
          // Always refresh - the query will filter by user ID
          setTimeout(fetchActivities, 500);
        }
      )
      .subscribe();

    return () => {
      accessLogsSubscription.unsubscribe();
      verificationsSubscription.unsubscribe();
      documentsSubscription.unsubscribe();
    };
  }, [user]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    return time.toLocaleDateString();
  };

  const getLocationFromIP = (ip: string) => {
    // Mock location based on IP patterns
    if (ip?.startsWith('192.168') || ip?.startsWith('10.')) return 'Local Network';
    if (ip?.includes('103')) return 'Bangalore, IN';
    if (ip?.includes('172')) return 'Mumbai, IN';
    return 'Unknown Location';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 mx-auto text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Activities</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 mx-auto text-green-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No recent activity</h3>
        <p className="text-gray-400">Your document activities will appear here</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/20 via-purple-500/10 to-transparent"></div>
      
      <div className="space-y-6">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.action];
          const Icon = config.icon;
          
          return (
            <div 
              key={activity.id} 
              className="relative flex items-start gap-4 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Timeline Dot */}
              <div className={`
                relative z-10 flex items-center justify-center w-12 h-12 rounded-full 
                ${config.bgColor} ${config.borderColor} border-2
                transition-all duration-300 ${config.glowColor}
                group-hover:scale-110 group-hover:shadow-lg
              `}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>

              {/* Activity Card */}
              <div className={`
                flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4
                transition-all duration-300 hover:bg-white/10 hover:border-white/20
                hover:shadow-xl hover:-translate-y-1 cursor-pointer
                ${config.glowColor}
              `}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(activity.accessedAt)}
                      </span>
                    </div>
                    
                    <h4 className="text-white font-medium mb-1">
                      {activity.documentName}
                    </h4>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {activity.metadata?.category && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400">
                          {activity.metadata.category}
                        </span>
                      )}
                      
                      {activity.metadata?.verifierName && (
                        <span>By {activity.metadata.verifierName}</span>
                      )}
                      
                      {activity.ipAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {getLocationFromIP(activity.ipAddress)}
                        </span>
                      )}
                      
                      {activity.shareToken && (
                        <span className="flex items-center gap-1">
                          <Link className="w-3 h-3" />
                          Secure link
                        </span>
                      )}
                      
                      {activity.metadata?.status && (
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          activity.metadata.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                          activity.metadata.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {activity.metadata.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
