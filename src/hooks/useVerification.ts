// Verification Logic Hook
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
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

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const supabase = createClient();

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
            profiles(first_name, last_name, email)
          `)
          .order('created_at', { ascending: false });
      } else {
        // Regular user: fetch only their own documents
        query = supabase
          .from('documents')
          .select('id, title, category, created_at, is_public, file_url, storage_path, user_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      }

      const { data: docsData, error: docsError } = await query;

      if (docsError) {
        console.error('Error fetching documents:', docsError);
        setError(docsError.message);
        return;
      }

      if (docsData.length === 0) {
        setDocuments([]);
        setLoading(false);
        return;
      }
      
      // For faculty, we already have profile data from the select query
      // For regular users, we need to fetch profile data separately
      let transformedData: VerificationDocument[] = [];
      
      if (profile?.role === 'faculty' || profile?.role === 'admin') {
        // Faculty/Admin: use the profile data from the select query
        const docIds = docsData.map(doc => doc.id);
        
        // Fetch verification status for each document
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
        transformedData = docsData.map((doc: any) => {
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
            studentName: `${doc.profiles?.[0]?.first_name || 'User'} ${doc.profiles?.[0]?.last_name || ''}`.trim() || 'User',
            studentEmail: doc.profiles?.[0]?.email || 'N/A',
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
      } else {
        // Regular user: fetch profile data separately
        const userIds = docsData.map(doc => doc.user_id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);
        
        if (profileError) {
          console.error('Error fetching profiles:', profileError);
          setError(profileError.message);
          return;
        }

        // Create a map of user profiles
        const profileMap = profileData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);

        // Fetch verification status for each document
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
        transformedData = docsData.map((doc: any) => {
          const profile = profileMap[doc.user_id];
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
            studentName: profile ? `${profile.first_name || 'User'} ${profile.last_name || ''}`.trim() : 'User',
            studentEmail: profile?.email || 'N/A',
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
      }

      setDocuments(transformedData);
    } catch (err: any) {
      console.error('Error in useVerification:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, profile?.role]);

  // Set up real-time subscription to update documents when verification status changes
  useEffect(() => {
    if (!user) return;
    
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
          filter: profile?.role === 'faculty' || profile?.role === 'admin' ? 'id=neq.null' : `user_id=eq.${user.id}` // Filter to user's documents for regular users, all documents for faculty
        },
        (payload) => {
          console.log('Document updated:', payload);
          fetchDocuments(); // Refresh the documents
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
          filter: profile?.role === 'faculty' || profile?.role === 'admin' ? 'document_id=neq.null' : `document_id.in.(select id from documents where user_id=eq.${user.id})` // Filter to user's document verifications for regular users, all verifications for faculty
        },
        (payload) => {
          console.log('Verification status updated:', payload);
          fetchDocuments(); // Refresh the documents
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'verifications',
          filter: profile?.role === 'faculty' || profile?.role === 'admin' ? 'document_id=neq.null' : `document_id.in.(select id from documents where user_id=eq.${user.id})` // Filter to user's document verifications for regular users, all verifications for faculty
        },
        (payload) => {
          console.log('Verification status updated:', payload);
          fetchDocuments(); // Refresh the documents
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(documentChannel);
      supabase.removeChannel(verificationChannel);
    };
  }, [user, profile?.role]);

  const refetch = () => {
    if (user) {
      fetchDocuments();
    }
  };

  return {
    documents,
    loading,
    error,
    refetch
  };
}
