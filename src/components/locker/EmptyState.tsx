"use client";

import { FileQuestion, Upload, FolderPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type?: "no-documents" | "no-results" | "no-folder";
  searchQuery?: string;
  onUpload?: () => void;
}

export function EmptyState({
  type = "no-documents",
  searchQuery,
  onUpload,
}: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case "no-results":
        return {
          icon: <Search className="w-20 h-20 text-purple-400/50" />,
          title: "No results found",
          description: searchQuery
            ? `No documents match "${searchQuery}". Try different keywords or clear filters.`
            : "No documents match your search criteria. Try adjusting your filters.",
          actions: null,
        };

      case "no-folder":
        return {
          icon: <FolderPlus className="w-20 h-20 text-purple-400/50" />,
          title: "This folder is empty",
          description: "Start organizing by uploading documents to this folder.",
          actions: onUpload ? (
            <Button
              onClick={onUpload}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          ) : null,
        };

      case "no-documents":
      default:
        return {
          icon: <FileQuestion className="w-20 h-20 text-purple-400/50" />,
          title: "Your locker is empty",
          description:
            "Upload your first document to get started. You can store certificates, transcripts, and important files securely.",
          actions: onUpload ? (
            <Button
              onClick={onUpload}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Document
            </Button>
          ) : null,
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">{content.icon}</div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white">{content.title}</h3>

        {/* Description */}
        <p className="text-gray-400 leading-relaxed">{content.description}</p>

        {/* Actions */}
        {content.actions && <div className="pt-4">{content.actions}</div>}
      </div>
    </div>
  );
}