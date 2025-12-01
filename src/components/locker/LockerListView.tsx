"use client";

import { useState } from "react";
import { 
  File, 
  Folder, 
  Check, 
  Clock, 
  X,
  ArrowUpDown 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentActions } from "./DocumentActions";

import { cn } from "@/lib/utils";

import { Document } from "@/types/locker.types";

interface LockerListViewProps {
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
  onAction: (action: string, docId: string) => void;
}

type SortField = "name" | "size" | "uploadedAt" | "status";
type SortOrder = "asc" | "desc";

export function LockerListView({
  documents,
  onDocumentClick,
  onAction,
}: LockerListViewProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    let compareValue = 0;

    switch (sortField) {
      case "name":
        compareValue = a.name.localeCompare(b.name);
        break;
      case "size":
        compareValue = (a.size || 0) - (b.size || 0);
        break;
      case "uploadedAt":
        compareValue = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case "status":
        const statusOrder = { verified: 1, pending: 2, rejected: 3 };
        compareValue = (statusOrder[a.status || "pending"] || 0) - (statusOrder[b.status || "pending"] || 0);
        break;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500 text-xs">
            <Check className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500 text-xs">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <span className="text-xs text-gray-500">—</span>;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (doc: Document) => {
    if (doc.type === "folder") {
      return <Folder className="w-5 h-5 text-purple-400" />;
    }
    return <File className="w-5 h-5 text-purple-300" />;
  };

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-t-xl">
        <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-400">
          {/* Name Column */}
          <div className="col-span-5 flex items-center gap-2">
            <button
              onClick={() => handleSort("name")}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              Name
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Status Column */}
          <div className="col-span-2 flex items-center gap-2">
            <button
              onClick={() => handleSort("status")}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              Status
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Size Column */}
          <div className="col-span-2 flex items-center gap-2">
            <button
              onClick={() => handleSort("size")}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              Size
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Date Column */}
          <div className="col-span-2 flex items-center gap-2">
            <button
              onClick={() => handleSort("uploadedAt")}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              Date
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Actions Column */}
          <div className="col-span-1 text-center">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="bg-white/5 backdrop-blur-sm border border-t-0 border-white/10 rounded-b-xl overflow-hidden">
        {sortedDocuments.map((doc, index) => (
          <div
            key={doc.id}
            className={cn(
              "grid grid-cols-12 gap-4 p-4 cursor-pointer transition-all duration-200",
              "hover:bg-white/10 border-b border-white/5 last:border-b-0",
              hoveredId === doc.id && "bg-white/10",
              index % 2 === 0 ? "bg-white/2" : "bg-transparent"
            )}
            onMouseEnter={() => setHoveredId(doc.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onDocumentClick(doc)}
          >
            {/* Name Column */}
            <div className="col-span-5 flex items-center gap-3">
              {getFileIcon(doc)}
              <span className="text-white font-medium truncate" title={doc.name}>
                {doc.name}
              </span>
            </div>

            {/* Status Column */}
            <div className="col-span-2 flex items-center">
              {getStatusBadge(doc.status)}
            </div>

            {/* Size Column */}
            <div className="col-span-2 flex items-center text-gray-400 text-sm">
              {doc.type === "folder" ? "Folder" : formatFileSize(doc.size)}
            </div>

            {/* Date Column */}
            <div className="col-span-2 flex items-center text-gray-400 text-sm">
              {formatDate(doc.uploadedAt)}
            </div>

            {/* Actions Column */}
            <div className="col-span-1 flex items-center justify-center">
            <DocumentActions
  documentId={doc.id}
  documentName={doc.name}
  onAction={onAction}
  showStar
  showArchive
/>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedDocuments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No documents found</p>
        </div>
      )}
    </div>
  );
}