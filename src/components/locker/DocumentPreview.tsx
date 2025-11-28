"use client";

import { useEffect } from "react";
import { X, Download, Share2, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { Document } from "@/types/locker.types";

interface DocumentPreviewProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (docId: string) => void;
  onShare: (docId: string) => void;
}

export function DocumentPreview({
  document: doc,  // ← RENAMED HERE to avoid conflict
  isOpen,
  onClose,
  onDownload,
  onShare,
}: DocumentPreviewProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);  // ← Now refers to browser document
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !doc) return null;  // ← Changed to doc

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500">
            <Check className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500">
            <XIcon className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileTypeIcon = () => {
    const fileType = doc.fileType?.toLowerCase() || "";  // ← Changed to doc
    
    if (fileType.includes("image") || fileType.includes("jpg") || fileType.includes("png")) {
      return <ImageIcon className="w-20 h-20 text-purple-400" />;
    }
    return <FileText className="w-20 h-20 text-purple-400" />;
  };

  const isImage = doc.fileType?.toLowerCase().includes("image") ||  // ← Changed to doc
                  doc.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);  // ← Changed to doc

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-4xl max-h-[90vh] overflow-hidden",
          "bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl",
          "shadow-2xl shadow-purple-500/10",
          "animate-in zoom-in-95 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white truncate mb-2">
              {doc.name}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              {getStatusBadge(doc.status)}
              <span className="text-sm text-gray-400">
                {formatFileSize(doc.size)}
              </span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-400">
                {formatDate(doc.uploadedAt)}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="ml-4 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Preview Area */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-220px)]">
          <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-purple-900/20 to-transparent rounded-xl border border-white/5">
            {isImage && doc.thumbnailUrl ? (
              <img
                src={doc.thumbnailUrl}
                alt={doc.name}
                className="max-w-full max-h-[500px] object-contain rounded-lg"
              />
            ) : doc.fileUrl ? (
              // For PDFs or other documents
              <iframe
                src={doc.fileUrl}
                className="w-full h-[500px] rounded-lg bg-white"
                title={doc.name}
              />
            ) : (
              // Fallback for files without preview
              <div className="flex flex-col items-center gap-4 text-gray-400">
                {getFileTypeIcon()}
                <p className="text-lg">Preview not available</p>
                <p className="text-sm">Download the file to view it</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-white/5">
          <Button
            variant="outline"
            onClick={() => onShare(doc.id)}
            className="border-white/10 hover:bg-purple-400/20 hover:border-purple-400/30"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={() => onDownload(doc.id)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}