'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, CheckCircle, XCircle, Calendar, User, LogOut } from 'lucide-react'
import { VerifyModal } from '@/components/verification/VerifyModal'
import { getUserInfo, formatUserInfo } from '@/lib/userUtils'
import { useRouter } from 'next/navigation'

// Use singleton client for consistent auth state
const supabase = getSupabaseClient();

interface VerificationRequest {
  id: string;
  document_id: string;
  document_title: string;
  document_category: string;
  document_url: string;
  document_storage_path: string;
  user_id: string;
  user_email: string;
  user_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export default function FacultyDashboard() {
  const { user, profile, initialized } = useUser();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<VerificationRequest | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (isReady) {
      fetchVerificationRequests();
    }
  }, [isReady]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Redirect to Vercel production URL
      window.location.href = 'https://student-portfolio-website-seven.vercel.app/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force redirect even if signOut fails
      window.location.href = 'https://student-portfolio-website-seven.vercel.app/';
    }
  };

  const handleDownload = async (document: VerificationRequest) => {
    try {
      console.log('Attempting to download:', document.document_title);
      console.log('Document ID:', document.document_id);
      
      // Use the faculty-specific download API
      const link = window.document.createElement('a');
      link.href = `/api/faculty-download/${document.document_id}`;
      link.download = document.document_title;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      console.log('Document downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      alert(`Failed to download document: ${error?.message || 'Unknown error'}`);
    }
  };

  const openVerifyModal = (document: VerificationRequest) => {
    setSelectedDocument(document);
    setShowVerifyModal(true);
  };

  const handleVerification = async (action: 'reject' | 'approve', reason?: string) => {
    if (!selectedDocument) return;

    try {
      console.log('Starting SIMPLE verification:', action, 'for document:', selectedDocument.document_title);
      
      // Use simple API - no mapping needed
      const apiAction = action === 'approve' ? 'verify' : 'reject';
      
      console.log('Calling SIMPLE API with action:', apiAction, 'reason:', reason);
      
      const response = await fetch(`/api/verify-simple/${selectedDocument.document_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: apiAction, reason }),
      });

      console.log('SIMPLE API response status:', response.status);
      
      const responseText = await response.text();
      console.log('SIMPLE API response text:', responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        console.error('SIMPLE API error:', errorData);
        throw new Error(errorData.error || 'Verification failed');
      }

      const result = JSON.parse(responseText);
      console.log('SIMPLE verification result:', result);

      // Show success message
      const actionText = action === 'approve' ? 'approved' : 'rejected';
      alert(`Document ${actionText} successfully!`);

      // Refresh the requests list IMMEDIATELY
      await fetchVerificationRequests();
      
      // Close modal
      setShowVerifyModal(false);
      setSelectedDocument(null);
    } catch (error: any) {
      console.error('SIMPLE verification error:', error);
      alert(`Verification failed: ${error?.message || 'Unknown error'}`);
    }
  };

  // Force refresh function
  const forceRefresh = async () => {
    console.log('Force refreshing verification requests...');
    await fetchVerificationRequests();
  };

  // Set up real-time subscription for document updates
  useEffect(() => {
    // Wait for auth to be ready before subscribing
    if (!isReady) return;

    // Subscribe to document changes
    const subscription = supabase
      .channel('document-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('Document change detected:', payload);
          // Refresh the dashboard when documents change
          fetchVerificationRequests();
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_rejections'
        },
        (payload) => {
          console.log('Rejection change detected:', payload);
          // Refresh the dashboard when rejections change
          fetchVerificationRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isReady]);

  // Separate function to fetch requests
  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          category,
          file_url,
          storage_path,
          user_id,
          created_at,
          updated_at,
          is_public
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user info using utility function
      const userIds = data?.map(doc => doc.user_id) || [];
      const userMap = await getUserInfo(userIds);

      // Debug: Log the actual data structure
      console.log('Faculty dashboard raw data:', data?.[0]);
      console.log('User map:', userMap);

      // Try to get rejection records, but don't fail if table doesn't exist
      let rejectedDocIds = new Set<string>();
      try {
        const { data: rejections } = await supabase
          .from('document_rejections')
          .select('document_id')
          .eq('document_id', data?.map(doc => doc.id) || []);
        
        rejectedDocIds = new Set(rejections?.map(r => r.document_id) || []);
      } catch (rejectionError) {
        console.log('Rejection table not found, using simple status logic');
        // If table doesn't exist, use a simpler approach
        // For now, treat all non-public as pending
      }

      const transformedRequests: VerificationRequest[] = data?.map(doc => {
        const userInfo = userMap.get(doc.user_id);
        const { displayName, displayEmail } = formatUserInfo(userInfo, doc.user_id);
        
        return {
          id: doc.id,
          document_id: doc.id,
          document_title: doc.title,
          document_category: doc.category,
          document_url: doc.file_url,
          document_storage_path: doc.storage_path,
          user_id: doc.user_id,
          user_email: displayEmail,
          user_name: displayName,
          status: doc.is_public ? 'approved' : (rejectedDocIds.has(doc.id) ? 'rejected' : 'pending'),
          created_at: doc.created_at,
          updated_at: doc.updated_at
        };
      }) || [];

      setRequests(transformedRequests);
    } catch (error: any) {
      console.error('Error fetching verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is initializing or data is loading
  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4">Loading verification requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Verification Requests</h1>
              <p className="text-gray-400">Review and verify student documents</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No verification requests found</h3>
            <p className="text-gray-400">There are no documents pending verification.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {request.document_title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        request.status === 'approved' ? 'bg-green-600' :
                        request.status === 'rejected' ? 'bg-red-600' :
                        'bg-red-500'
                      }>
                        {request.status === 'approved' ? 'Approved' :
                         request.status === 'rejected' ? 'Rejected' :
                         'Rejected - Contact Faculty'}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        {request.document_category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      {request.user_name} ({request.user_email})
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(request)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                      onClick={() => openVerifyModal(request)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* VerifyModal Component */}
        <VerifyModal
          isOpen={showVerifyModal}
          onClose={() => {
            setShowVerifyModal(false);
            setSelectedDocument(null);
          }}
          onVerify={handleVerification}
          documentName={selectedDocument?.document_title || 'Unknown Document'}
          documentType={`${selectedDocument?.user_name}'s Document`}
          currentStatus={selectedDocument?.status || 'pending'}
        />
      </div>
    </div>
  );
}
