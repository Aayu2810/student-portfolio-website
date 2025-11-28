"use client";

import { useState } from "react";
import { File, Folder, MoreVertical, Check, Clock, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type: "file" | "folder";
  fileType?: string;
  size?: number;
  status?: "verified" | "pending" | "rejected";
  uploadedAt: string;
  thumbnailUrl?: string;
}

interface LockerGridProps {
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
  onAction: (action: string, docId: string) => void;
}

export function LockerGrid({
  documents,
  onDocumentClick,
  onAction,
}: LockerGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (doc: Document) => {
    if (doc.type === "folder") {
      return <Folder className="w-12 h-12 text-purple-400" />;
    }
    return <File className="w-12 h-12 text-purple-300" />;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className={cn(
            "relative overflow-hidden cursor-pointer transition-all duration-300",
            "bg-white/8 backdrop-blur-[20px] border border-white/10 rounded-2xl",
            "hover:bg-white/12 hover:border-purple-400/30 hover:-translate-y-1",
            hoveredId === doc.id && "shadow-[0_8px_32px_rgba(139,92,246,0.15)]"
          )}
          onMouseEnter={() => setHoveredId(doc.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onDocumentClick(doc)}
        >
          {/* Preview Area */}
          <div className="h-48 flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-transparent relative">
            {doc.thumbnailUrl ? (
              <img
                src={doc.thumbnailUrl}
                alt={doc.name}
                className="w-full h-full object-cover"
              />
            ) : (
              getFileIcon(doc)
            )}

            {/* Status Badge - Top Right */}
            {doc.status && (
              <div className="absolute top-3 right-3">
                {getStatusBadge(doc.status)}
              </div>
            )}
          </div>

          {/* Document Info */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="text-base font-semibold text-white truncate flex-1"
                title={doc.name}
              >
                {doc.name}
              </h3>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-purple-400/20"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-slate-800/95 backdrop-blur-md border-white/10"
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("preview", doc.id);
                    }}
                  >
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("download", doc.id);
                    }}
                  >
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("share", doc.id);
                    }}
                  >
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("rename", doc.id);
                    }}
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("move", doc.id);
                    }}
                  >
                    Move
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction("delete", doc.id);
                    }}
                    className="text-red-500 focus:text-red-500"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{doc.type === "folder" ? "Folder" : formatFileSize(doc.size)}</span>
              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}