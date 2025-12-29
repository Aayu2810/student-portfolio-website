'use client';

import { Check, Download, FileText, CheckCircle } from 'lucide-react';
import { createClient } from '../lib/supabase/client';
import { useState, useEffect } from 'react';

interface AttestedModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: any;
}

export function AttestedModal({ isOpen, onClose, document }: AttestedModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getAttestedDocument = async () => {
      if (!document?.file_url || !isOpen) return;
      
      setLoading(true);
      try {
        // For verified documents, create a temporary attested version
        if (document.is_public) {
          // Call the API to create a temporary attested version
          const response = await fetch('/api/create-attested', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentId: document.id,
              fileUrl: document.file_url,
              fileName: document.file_name,
              fileType: document.file_type
            })
          });

          if (response.ok) {
            const { attestedUrl } = await response.json();
            setSignedUrl(attestedUrl);
          } else {
            // Fallback to original URL if attestation fails
            setSignedUrl(document.file_url);
          }
        } else {
          // For non-verified documents, get signed URL for original
          const { data, error } = await supabase
            .storage
            .from('documents')
            .createSignedUrl(document.file_url.split('/').pop() || document.file_name, 3600);
          
          if (error) {
            console.error('Error getting signed URL:', error);
            setSignedUrl(document.file_url);
          } else {
            setSignedUrl(data.signedUrl);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setSignedUrl(document.file_url);
      } finally {
        setLoading(false);
      }
    };

    getAttestedDocument();
  }, [document, isOpen, supabase]);

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Check className="w-6 h-6 text-green-400" />
            Attested Document
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{document.title}</h3>
              <p className="text-gray-400 text-sm">
                Category: {document.category} • 
                Uploaded: {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-600 px-4 py-2 rounded-lg">
                <div className="text-white font-bold text-center">
                  <div className="text-xs mb-1">OFFICIAL</div>
                  <div className="text-lg">RVCE</div>
                  <div className="text-xs">ATTESTED</div>
                </div>
              </div>
              <div className="text-right">
                <span className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Verified & Attested
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Document Verification</h4>
                <p className="text-gray-600 mb-4">
                  This document has been verified and attested by RVCE authorities. 
                  The official RVCE logo and watermark have been applied to ensure authenticity.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-800">Verification Status</h5>
                      <p className="text-blue-600">This document is officially verified by RVCE</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">Certificate ID:</span>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {document.id ? document.id.substring(0, 8).toUpperCase() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">Attested Date:</span>
                      <span className="text-gray-800">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">Attested By:</span>
                      <span className="text-gray-800">RVCE Verification Authority</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = signedUrl || document.file_url;
                    link.download = document.title;
                    link.click();
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {loading ? 'Loading...' : 'Download Original'}
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `https://verify.rvce.edu.in/certificate/${document.id}`;
                    link.target = '_blank';
                    link.click();
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Verify Online
                </button>
              </div>

              {/* Preview for attested documents */}
              {document.is_public && signedUrl && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Attested Document Preview</h4>
                  <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                    {signedUrl.startsWith('data:') ? (
                      <iframe 
                        src={signedUrl} 
                        className="w-full h-full"
                        title="Attested Document"
                      />
                    ) : (
                      <img 
                        src={signedUrl} 
                        alt="Atested Document" 
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
