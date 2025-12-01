'use client';

import { useState } from "react";
import { VerifyModal } from "@/components/verification/VerifyModal";
import { RejectModal } from "@/components/verification/RejectModal";

export default function SingleVerificationPage({ params }: { params: { docId: string } }) {
  const [verifyModalOpen, setVerifyModalOpen] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const handleVerify = (action: "approve" | "reject", reason?: string) => {
    console.log("Action:", action);
    if (reason) console.log("Reason:", reason);
    alert(`Document ${action}d${reason ? ` with reason: ${reason}` : ""}`);
    
    // Close modal after action
    setVerifyModalOpen(false);
  };

  const handleReject = (reason: string) => {
    console.log("Rejection reason:", reason);
    alert(`Document rejected with reason: ${reason}`);
    
    // Close modal after action
    setRejectModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Verify Document: {params.docId}
        </h1>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Document Details</h2>
          <div className="space-y-3 text-gray-300">
            <p><span className="font-medium text-white">Document ID:</span> {params.docId}</p>
            <p><span className="font-medium text-white">Document Name:</span> Sample_Document.pdf</p>
            <p><span className="font-medium text-white">Upload Date:</span> November 27, 2024</p>
            <p><span className="font-medium text-white">File Size:</span> 2.4 MB</p>
            <p><span className="font-medium text-white">Uploader:</span> John Doe (RVCE Bangalore)</p>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Document Preview</h2>
          <div className="border border-white/10 rounded-lg h-96 flex items-center justify-center bg-gray-900/50">
            <p className="text-gray-500">Document preview would appear here</p>
          </div>
        </div>
        
        <VerifyModal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          onVerify={handleVerify}
          documentName="Sample_Document.pdf"
          documentType="Academic Certificate"
        />
        
        <RejectModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onReject={handleReject}
          documentName="Sample_Document.pdf"
        />
      </div>
    </div>
  );
}
