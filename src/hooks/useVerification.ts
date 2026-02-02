// Simple Verification Hook - No Complex Real-time, Fast Loading
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../lib/supabase/client';
import { useUser } from './useUser';

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

export function useVerification() {
  const { user, profile } = useUser();
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch initial data - only runs when user or profile changes
  useEffect(() => {
    const fetchVerificationDocuments = async () => {
      if (!user || !profile) {
        setDocuments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let query;
        if (profile?.role === 'faculty' || profile?.role === 'admin') {
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
              profiles!documents_user_id_fkey (
                first_name, 
                last_name, 
                email
              )
            `)
            .order('created_at', { ascending: false });
        } else {
          // Student: fetch only their documents (we'll filter to show only rejected or pending verification ones)
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
              profiles!documents_user_id_fkey (
                first_name, 
                last_name, 
                email
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        // Get rejection records to determine status
        let rejectedDocIds = new Set<string>();
        let rejectionData: any[] = [];
        try {
          const { data: rejections } = await supabase
            .from('document_rejections')
            .select('document_id, rejection_reason')
            .in('document_id', data?.map(doc => doc.id) || []);
          
          rejectedDocIds = new Set(rejections?.map((r: any) => r.document_id) || []);
          rejectionData = rejections || [];
        } catch (rejectionError) {
          console.log('Rejection table not found, using simple status logic');
        }

        // Transform data to match VerificationDocument interface
        const transformedData: VerificationDocument[] = data?.map(doc => {
          const profile = Array.isArray(doc.profiles) ? doc.profiles[0] : doc.profiles;
          const isRejected = rejectedDocIds.has(doc.id);
          const rejection = isRejected 
            ? rejectionData.find((r: any) => r.document_id === doc.id)?.rejection_reason 
            : undefined;

          return {
            id: doc.id,
            studentName: profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}`.trim()
              : profile?.first_name || `Student-${doc.user_id.slice(0, 6)}`,
            studentEmail: profile?.email && profile?.email !== 'user@example.com'
              ? profile.email
              : `student-${doc.user_id.slice(0, 6)}@campus.edu`,
            studentDepartment: 'Computer Science',
            documentName: doc.title,
            documentType: doc.category,
            uploadedAt: doc.created_at,
            status: doc.is_public ? 'verified' : (isRejected ? 'rejected' : 'pending'),
            rejectionReason: rejection,
            userId: doc.user_id,
            file_url: doc.file_url,
            storage_path: doc.storage_path
          };
        }) || [];

        // For students: only show documents that have been rejected or are truly pending verification
        // Exclude private documents that haven't been submitted for verification
        const filteredData = profile?.role === 'faculty' || profile?.role === 'admin'
          ? transformedData
          : transformedData.filter(doc => 
              doc.status === 'rejected' || 
              doc.status === 'verified' ||
              (doc.status === 'pending' && rejectedDocIds.has(doc.id))
            );

        setDocuments(filteredData);
      } catch (err: any) {
        console.error('Error fetching verification documents:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationDocuments();
  }, [user, profile]);

  const refetch = useCallback(() => {
    // Simple refetch function
    if (!user || !profile) return;
    
    setLoading(true);
    const fetchVerificationDocuments = async () => {
        try {
          setError(null);

          let query;
          if (profile?.role === 'faculty' || profile?.role === 'admin') {
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
                profiles!documents_user_id_fkey (
                  first_name, 
                  last_name, 
                  email
                )
              `)
              .order('created_at', { ascending: false });
          } else {
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
                profiles!documents_user_id_fkey (
                  first_name, 
                  last_name, 
                  email
                )
              `)
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
          }

          const { data } = await query;

          const transformedData: VerificationDocument[] = data?.map(doc => {
            const profile = Array.isArray(doc.profiles) ? doc.profiles[0] : doc.profiles;
            return {
              id: doc.id,
              studentName: profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`.trim()
                : profile?.first_name || `Student-${doc.user_id.slice(0, 6)}`,
              studentEmail: profile?.email && profile?.email !== 'user@example.com'
                ? profile.email
                : `student-${doc.user_id.slice(0, 6)}@campus.edu`,
              studentDepartment: 'Computer Science',
              documentName: doc.title,
              documentType: doc.category,
              uploadedAt: doc.created_at,
              status: doc.is_public ? 'verified' : 'pending',
              userId: doc.user_id,
              file_url: doc.file_url,
              storage_path: doc.storage_path
            };
          }) || [];

          setDocuments(transformedData);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchVerificationDocuments();
  }, [user, profile]);

  return {
    documents,
    loading,
    error,
    refetch
  };
}
