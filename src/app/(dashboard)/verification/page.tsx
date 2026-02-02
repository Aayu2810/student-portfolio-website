'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useVerification } from '@/hooks/useVerification'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, User, Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function VerificationPage() {
  const { documents, loading, error } = useVerification()
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setUserRole(profile?.role || 'student')
      }
    }

    fetchUserRole()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <FileText className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Verification Status</h1>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-4 text-gray-400">Loading verification requests...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <FileText className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Verification Status</h1>
          </div>
          <div className="text-center py-12">
            <p className="text-red-400">Error loading verification requests: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  const userDocuments = documents.filter(doc => doc.userId === 'current-user') // This will be filtered by the hook

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 mb-8">
            <FileText className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Verification Status</h1>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No verification requests found</h3>
            <p className="text-gray-400 mb-6">
              {userRole === 'faculty' 
                ? "There are no documents pending verification."
                : "You haven't submitted any documents for verification yet."
              }
            </p>
            {userRole !== 'faculty' && (
              <Link href="/dashboard">
                <Button>Upload Documents</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {doc.documentName}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-1">
                        {doc.documentType} • Uploaded by {doc.studentName}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={doc.status === 'verified' ? 'default' : 
                              doc.status === 'rejected' ? 'destructive' : 'secondary'}
                      className={
                        doc.status === 'verified' ? 'bg-green-600' :
                        doc.status === 'rejected' ? 'bg-red-600' :
                        'bg-red-500'
                      }
                    >
                      {doc.status === 'in-review' ? 'In Review' : 
                       doc.status === 'pending' ? 'Rejected - Contact Faculty' :
                       doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{doc.studentEmail}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {doc.rejectionReason && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                      <p className="text-red-400 text-sm">
                        <strong>Rejection Reason:</strong> {doc.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {doc.file_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Document
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
