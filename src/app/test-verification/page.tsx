"use client";

import { useState } from "react";
import { VerificationCard } from "@/components/verification/VerificationCard";
import { VerifyModal } from "@/components/verification/VerifyModal";

export default function TestVerificationPage() {
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ name: string; type: string } | null>(null);

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
      </div>
    </div>
  );
}