"use client";

import { useState } from "react";
import { LockerGrid } from "@/components/locker/LockerGrid";
import { LockerListView } from "@/components/locker/LockerListView";
import { Button } from "@/components/ui/button";
import { Grid3x3, List } from "lucide-react";

export default function TestLockerPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    {
      id: "4",
      name: "Resume.pdf",
      type: "file" as const,
      fileType: "pdf",
      size: 950000,
      status: "verified" as const,
      uploadedAt: "2025-11-18T14:20:00Z",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">Locker Views Test</h1>
        
        {/* View Toggle Buttons */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center gap-2"
          >
            <Grid3x3 className="w-4 h-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <LockerGrid
          documents={sampleDocuments}
          onDocumentClick={(doc) => console.log("Clicked:", doc)}
          onAction={(action, docId) => console.log("Action:", action, docId)}
        />
      ) : (
        <LockerListView
          documents={sampleDocuments}
          onDocumentClick={(doc) => console.log("Clicked:", doc)}
          onAction={(action, docId) => console.log("Action:", action, docId)}
        />
      )}
    </div>
  );
}