"use client";

import { useState } from "react";
import { VerificationCard } from "@/components/verification/VerificationCard";
import { VerifyModal } from "@/components/verification/VerifyModal";
import { VerificationBadge } from "@/components/verification/VerificationBadge";
import { Button } from "@/components/ui/button"; 
import { RejectModal } from "@/components/verification/RejectModal";

export default function TestVerificationPage() {
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ name: string; type: string } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const handleViewDetails = (docId: string) => {
    console.log("View details:", docId);
    const docs = {
      "1": { name: "Degree Certificate.pdf", type: "Academic Certificate" },
      "2": { name: "Transcript.pdf", type: "Academic Transcript" },
      "3": { name: "ID Card.jpg", type: "Identity Document" },
      "4": { name: "Birth Certificate.pdf", type: "Legal Document" },
    };
    setSelectedDoc(docs[docId as keyof typeof docs]);
    setVerifyModalOpen(true);
  };

  const handleReupload = (docId: string) => {
    console.log("Reupload:", docId);
    alert(`Reupload document: ${docId}`);
  };

  const handleVerify = (action: "approve" | "reject", reason?: string) => {
    console.log("Action:", action);
    if (reason) console.log("Reason:", reason);
    alert(`Document ${action}d${reason ? ` with reason: ${reason}` : ""}`);
  };

  const handleReject = (reason: string) => {
    console.log("Rejection reason:", reason);
    alert(`Document rejected with reason: ${reason}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">
          Verification Components Test Page
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending */}
          <VerificationCard
            documentId="1"
            documentName="Degree Certificate.pdf"
            documentType="Academic Certificate"
            uploadedAt="2024-11-27T10:00:00Z"
            status="pending"
            onViewDetails={handleViewDetails}
          />

          {/* In Review */}
          <VerificationCard
            documentId="2"
            documentName="Transcript.pdf"
            documentType="Academic Transcript"
            uploadedAt="2024-11-26T14:30:00Z"
            status="in-review"
            onViewDetails={handleViewDetails}
          />

          {/* Verified */}
          <VerificationCard
            documentId="3"
            documentName="ID Card.jpg"
            documentType="Identity Document"
            uploadedAt="2024-11-20T09:15:00Z"
            status="verified"
            onViewDetails={handleViewDetails}
          />

          {/* Rejected */}
          <VerificationCard
            documentId="4"
            documentName="Birth Certificate.pdf"
            documentType="Legal Document"
            uploadedAt="2024-11-25T16:45:00Z"
            status="rejected"
            rejectionReason="The document appears to be a photocopy. Please upload the original document or a certified copy."
            onViewDetails={handleViewDetails}
            onReupload={handleReupload}
          />
        </div>

        {/* Test Reject Modal Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setRejectModalOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            Test Reject Modal
          </Button>
        </div>

        {/* Badge Showcase Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-white">Verification Badges</h2>
          
          {/* Size Variants */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Size Variants</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-gray-400 w-24">Small:</span>
                <VerificationBadge status="verified" size="sm" />
                <VerificationBadge status="pending" size="sm" />
                <VerificationBadge status="rejected" size="sm" />
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-400 w-24">Medium:</span>
                <VerificationBadge status="verified" size="md" />
                <VerificationBadge status="pending" size="md" />
                <VerificationBadge status="rejected" size="md" />
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-400 w-24">Large:</span>
                <VerificationBadge status="verified" size="lg" />
                <VerificationBadge status="pending" size="lg" />
                <VerificationBadge status="rejected" size="lg" />
              </div>
            </div>
          </div>

          {/* All Status Types */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">All Status Types</h3>
            
            <div className="flex flex-wrap gap-3">
              <VerificationBadge status="verified" />
              <VerificationBadge status="in-review" />
              <VerificationBadge status="pending" />
              <VerificationBadge status="rejected" />
              <VerificationBadge status="expired" />
            </div>
          </div>

          {/* Icon Only */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Icon Only (No Label)</h3>
            
            <div className="flex flex-wrap gap-3">
              <VerificationBadge status="verified" showLabel={false} />
              <VerificationBadge status="in-review" showLabel={false} />
              <VerificationBadge status="pending" showLabel={false} />
              <VerificationBadge status="rejected" showLabel={false} />
              <VerificationBadge status="expired" showLabel={false} />
            </div>
          </div>
        </div>

        {/* Verify Modal */}
        {selectedDoc && (
          <VerifyModal
            isOpen={verifyModalOpen}
            onClose={() => setVerifyModalOpen(false)}
            onVerify={handleVerify}
            documentName={selectedDoc.name}
            documentType={selectedDoc.type}
          />
        )}

        <RejectModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onReject={handleReject}
          documentName="Test Document.pdf"
        />
      </div>
    </div>
  );
}