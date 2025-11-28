"use client";

import { VerificationCard } from "@/components/verification/VerificationCard";

export default function TestVerificationPage() {
  const handleViewDetails = (docId: string) => {
    console.log("View details:", docId);
    alert(`View details for document: ${docId}`);
  };

  const handleReupload = (docId: string) => {
    console.log("Reupload:", docId);
    alert(`Reupload document: ${docId}`);
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
      </div>
    </div>
  );
}