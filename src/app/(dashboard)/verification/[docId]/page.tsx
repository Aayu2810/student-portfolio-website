'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { VerifyModal } from "@/components/verification/VerifyModal";
import { RejectModal } from "@/components/verification/RejectModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Eye } from "lucide-react";

export default function SingleVerificationPage({ params }: { params: { docId: string } }) {
  const router = useRouter();
  const { user, profile } = useUser();
  const supabase = createClient();
  
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  
  const isFaculty = profile?.role === 'faculty' || profile?.role === 'admin';

  useEffect(() => {
    const fetchDocument = async () => {
      if (!user || !profile) return;

      try {
        setLoading(true);
        const { data: doc, error } = await supabase
          .from('documents')
          .select(`
            id,
            title,
            category,
            created_at,
            is_public,
            file_url,
            storage_path,
            file_name,
            file_type,
            file_size,
            user_id,
            profiles!documents_user_id_fkey (
              first_name,
              last_name,
              email
            )
          `)
          .eq('id', params.docId)
          .single();

        if (error) throw error;
        
        // Check if student is trying to view someone else's document
        if (!isFaculty && doc.user_id !== user.id) {
          alert('Access denied');
          router.push('/verification');
          return;
        }
        
        setDocument(doc);
        
        // Fetch rejection reason if exists
        try {
          const { data: rejection } = await supabase
            .from('document_rejections')
            .select('rejection_reason')
            .eq('document_id', params.docId)
            .single();
          
          if (rejection) {
            setRejectionReason(rejection.rejection_reason);
          }
        } catch (err) {
          // No rejection record found
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching document:', err);
        alert('Failed to load document');
        router.push('/verification');
      }
    };
    
    fetchDocument();
  }, [params.docId, user, isFaculty, router, supabase]);

  const handleVerify = async (action: "approve" | "reject", reason?: string) => {
    try {
      const response = await fetch(`/api/verify-simple/${params.docId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action === 'approve' ? 'verify' : 'reject', reason }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Verification failed');
      }
      
      alert(`Document ${action}d successfully!`);
      router.push('/verification');
    } catch (error: any) {
      alert(error.message || 'Failed to verify document');
    }
    
    setVerifyModalOpen(false);
  };

  const handleReject = async (reason: string) => {
    await handleVerify('reject', reason);
    setRejectModalOpen(false);
  };
  
  const openDocument = async () => {
    if (!document?.storage_path) return;
    
    try {
      const { data: signedUrl, error } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(document.storage_path, 3600);
      
      if (error) throw error;
      window.open(signedUrl.signedUrl, '_blank');
    } catch (err) {
      console.error('Error opening document:', err);
      alert('Failed to open document');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-red-400">Document not found</p>
          <Button onClick={() => router.push('/verification')} className="mt-4">
            Back to Verification
          </Button>
        </div>
      </div>
    );
  }
  
  const profile_data = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          onClick={() => router.push('/verification')} 
          variant="outline" 
          className="mb-6 border-white/10 hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Verification
        </Button>
        
        <h1 className="text-3xl font-bold text-white mb-8">
          {isFaculty ? 'Verify' : 'View'} Document
        </h1>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Document Details</h2>
          <div className="space-y-3 text-gray-300">
            <p><span className="font-medium text-white">Document Name:</span> {document.title}</p>
            <p><span className="font-medium text-white">Category:</span> {document.category}</p>
            <p><span className="font-medium text-white">Upload Date:</span> {new Date(document.created_at).toLocaleDateString()}</p>
            <p><span className="font-medium text-white">File Type:</span> {document.file_type}</p>
            <p><span className="font-medium text-white">File Size:</span> {(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
            {isFaculty && (
              <p><span className="font-medium text-white">Uploader:</span> {profile_data?.first_name} {profile_data?.last_name} ({profile_data?.email})</p>
            )}
            <p>
              <span className="font-medium text-white">Status:</span>{' '}
              <span className={`px-2 py-1 rounded-full text-xs ${
                document.is_public ? 'bg-green-600' : rejectionReason ? 'bg-red-600' : 'bg-yellow-600'
              }`}>
                {document.is_public ? 'Verified' : rejectionReason ? 'Rejected' : 'Pending'}
              </span>
            </p>
          </div>
          
          {rejectionReason && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm">
                <strong>Rejection Reason:</strong> {rejectionReason}
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Document Actions</h2>
          </div>
          <div className="flex gap-3">
            <Button onClick={openDocument} className="bg-purple-600 hover:bg-purple-700">
              <Eye className="w-4 h-4 mr-2" />
              Open Document
            </Button>
            {isFaculty && !document.is_public && (
              <>
                <Button 
                  onClick={() => setVerifyModalOpen(true)} 
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button 
                  onClick={() => setRejectModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
        
        {isFaculty && (
          <>
            <VerifyModal
              isOpen={verifyModalOpen}
              onClose={() => setVerifyModalOpen(false)}
              onVerify={handleVerify}
              documentName={document.title}
              documentType={document.category}
              canVerify={true}
              currentStatus={document.is_public ? 'approved' : rejectionReason ? 'rejected' : 'pending'}
            />
            
            <RejectModal
              isOpen={rejectModalOpen}
              onClose={() => setRejectModalOpen(false)}
              onReject={handleReject}
              documentName={document.title}
            />
          </>
        )}
      </div>
    </div>
  );
}
