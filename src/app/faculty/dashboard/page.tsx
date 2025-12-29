'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, User, Eye, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { VerifyModal } from '@/components/verification/VerifyModal';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  category: string;
  created_at: string;
  is_public: boolean;
  file_url: string;
  storage_path: string;
  user_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  }[];
}

interface VerificationRequest {
  id: string;
  document_id: string;
  status: string;
  verifier_id: string;
  created_at: string;
  documents?: {
    title: string;
    profiles?: {
      first_name: string;
      last_name: string;
      email: string;
    }[];
  };
}

export default function FacultyDashboardPage() {
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [allDocuments, setAllDocuments] = useState<any[]>([]);
  const [allVerifications, setAllVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      console.log('=== DASHBOARD: Fetching all data ===');
      
      try {
        const supabase = createClient();
        
        // Fetch all users
        console.log('Fetching all users...');
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('first_name');
        
        if (!usersError && usersData) {
          console.log('SUCCESS: Found', usersData.length, 'users');
          setAllUsers(usersData);
        } else {
          console.error('Users error:', usersError);
        }
        
        // Check current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        console.log('Current faculty user:', currentUser?.email, currentUser?.id);

        // Fetch all documents using bypass function (ignores RLS)
        console.log('Fetching all documents via bypass function...');
        const { data: documentsData, error: documentsError } = await supabase
          .rpc('get_all_documents_for_faculty');
        
        console.log('Documents query error:', documentsError);
        console.log('Raw documents data:', documentsData);
        
        if (!documentsError && documentsData) {
          console.log('SUCCESS: Found', documentsData.length, 'documents');
          documentsData.forEach((doc: any, index: number) => {
            console.log(`Document ${index + 1}:`, {
              id: doc.id,
              title: doc.title,
              user_id: doc.user_id,
              profile: doc.profiles
            });
          });
          
          // Set documents data directly from bypass function
          setAllDocuments(documentsData);
        } else {
          console.error('Documents error:', documentsError);
        }
        
        // Fetch all verification requests using bypass function (ignores RLS)
        console.log('Fetching all verifications via bypass function...');
        const { data: verificationsData, error: verificationsError } = await supabase
          .rpc('get_all_verifications_for_faculty');
        
        if (!verificationsError && verificationsData) {
          console.log('SUCCESS: Found', verificationsData.length, 'verification requests');
          verificationsData.forEach((verification: any, index: number) => {
            console.log(`Verification ${index + 1}:`, {
              id: verification.id,
              document_id: verification.document_id,
              status: verification.status,
              document_title: (verification.documents as any)?.title,
              document_profile: (verification.documents as any)?.profiles,
              verifier_id: verification.verifier_id
            });
          });
          setAllVerifications(verificationsData);
        } else {
          console.error('Verifications error:', verificationsError);
        }
        
        setLoading(false);
        
      } catch (e) {
        console.error('Dashboard fetch error:', e);
        setLoading(false);
      }
    };

    fetchAllData();

    // Set up real-time subscriptions
    const supabase = createClient();
    
    // Listen for new documents
    const documentChannel = supabase
      .channel('faculty-document-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('Document change detected:', payload);
          fetchAllData(); // Refresh all data
        }
      )
      .subscribe();
      
    // Listen for verification changes
    const verificationChannel = supabase
      .channel('faculty-verification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verifications'
        },
        (payload) => {
          console.log('Verification change detected:', payload);
          fetchAllData(); // Refresh all data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(documentChannel);
      supabase.removeChannel(verificationChannel);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'in-review': return 'bg-blue-600';
      case 'approved':
      case 'verified': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-review': return <Eye className="w-4 h-4" />;
      case 'approved':
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleVerification = async (action: "approve" | "reject", reason?: string) => {
    if (!selectedDocument) return;
    
    setUpdating(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // First, update or insert verification record
      const verificationData = {
        document_id: selectedDocument.document_id || selectedDocument.id,
        status: action === 'approve' ? 'verified' : 'rejected',
        verifier_id: user?.id,
        rejection_reason: action === 'reject' ? reason : null,
        updated_at: new Date().toISOString()
      };

      // Check if verification record exists
      const { data: existingVerification } = await supabase
        .from('verifications')
        .select('id')
        .eq('document_id', selectedDocument.document_id || selectedDocument.id)
        .single();

      let verificationError;
      if (existingVerification) {
        // Update existing verification
        const { error } = await supabase
          .from('verifications')
          .update(verificationData)
          .eq('id', existingVerification.id);
        verificationError = error;
      } else {
        // Insert new verification
        const { error } = await supabase
          .from('verifications')
          .insert({
            ...verificationData,
            created_at: new Date().toISOString()
          });
        verificationError = error;
      }

      if (verificationError) {
        console.error('Verification update error:', verificationError);
        alert('Failed to update verification status');
        return;
      }

      // Update documents table
      const { error: docError } = await supabase
        .from('documents')
        .update({ 
          is_public: action === 'approve',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedDocument.document_id || selectedDocument.id);

      if (docError) {
        console.error('Document update error:', docError);
      }

      // Update local state immediately for real-time UI update
      setAllVerifications(prev => 
        prev.map(v => 
          v.document_id === (selectedDocument.document_id || selectedDocument.id)
            ? { ...v, ...verificationData }
            : v
        )
      );

      setShowVerifyModal(false);
      setSelectedDocument(null);
      
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to process verification');
    } finally {
      setUpdating(false);
    }
  };

  const openVerifyModal = (verification: any) => {
    setSelectedDocument(verification);
    setShowVerifyModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="mt-4">Loading Faculty Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Faculty Verification Dashboard</h1>
          <p className="text-gray-400">All verification requests and user management</p>
        </div>

        
        {/* All Documents */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">All Documents ({allDocuments.length})</h2>
          <div className="space-y-4">
            {allDocuments.map((doc) => (
              <Card key={doc.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {doc.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={doc.is_public ? 'bg-green-600' : 'bg-yellow-600'}>
                        {doc.is_public ? 'Public' : 'Private'}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        {doc.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Uploaded by {doc.first_name} {doc.last_name} ({doc.email}) • 
                    {new Date(doc.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                      onClick={() => openVerifyModal({
                        id: doc.id,
                        document_id: doc.id,
                        documents: { title: doc.title }
                      })}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Verification Requests */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">All Verification Requests ({allVerifications.length})</h2>
          <div className="space-y-4">
            {allVerifications.map((verification) => (
              <Card key={verification.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(verification.status)}
                      {verification.document_title || 'Unknown Document'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(verification.status)}>
                        {verification.status}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500 text-purple-400">
                        Can be updated
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Requested {new Date(verification.created_at).toLocaleDateString()} • 
                    Last updated {new Date(verification.updated_at || verification.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Document Owner:</span>
                      <div className="text-white">
                        {verification.first_name ? 
                          `${verification.first_name} ${verification.last_name}` : 
                          'Unknown User'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Email:</span>
                      <div className="text-white">
                        {verification.email || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Verifier ID:</span>
                      <div className="text-white font-mono text-xs">{verification.verifier_id}</div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      {verification.file_url && (
                        <a href={verification.file_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </a>
                      )}
                      {/* Verify Button - Available for ALL requests */}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                        onClick={() => openVerifyModal(verification)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review & Update Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* VerifyModal Component */}
      <VerifyModal
        isOpen={showVerifyModal}
        onClose={() => {
          setShowVerifyModal(false);
          setSelectedDocument(null);
        }}
        onVerify={handleVerification}
        documentName={selectedDocument?.documents?.title || selectedDocument?.documentName || 'Unknown Document'}
        documentType={`${selectedDocument?.documents?.profiles?.[0]?.first_name ? 
          `${selectedDocument.documents.profiles[0].first_name} ${selectedDocument.documents.profiles[0].last_name}'s Document` : 
          'Document'} (Current: ${selectedDocument?.status?.toUpperCase() || 'UNKNOWN'})`}
        canVerify={!updating}
      />
    </div>
  );
}