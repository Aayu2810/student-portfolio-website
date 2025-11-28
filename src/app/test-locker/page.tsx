"use client";

import { LockerGrid } from "@/components/locker/LockerGrid";

export default function TestLockerPage() {
  const sampleDocuments = [
    {
      id: "1",
      name: "Certificate.pdf",
      type: "file" as const,
      fileType: "pdf",
      size: 2400000,
      status: "verified" as const,
      uploadedAt: "2025-11-20T10:30:00Z",
    },
    {
      id: "2",
      name: "Internship Letter.pdf",
      type: "file" as const,
      fileType: "pdf",
      size: 1800000,
      status: "pending" as const,
      uploadedAt: "2025-11-25T14:20:00Z",
    },
    {
      id: "3",
      name: "My Projects",
      type: "folder" as const,
      uploadedAt: "2025-11-15T09:00:00Z",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">
        Locker Grid Test
      </h1>
      <LockerGrid
        documents={sampleDocuments}
        onDocumentClick={(doc) => console.log("Clicked:", doc)}
        onAction={(action, docId) => console.log("Action:", action, docId)}
      />
    </div>
  );
}