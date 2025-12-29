"use client";

import { Clock, FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VerificationCardProps {
  documentId: string;
  documentName: string;
  documentType: string;
  uploadedAt: string;
  status: "pending" | "in-review" | "verified" | "rejected";
  rejectionReason?: string;
  onViewDetails: (docId: string) => void;
  onReupload?: (docId: string) => void;
  onViewDocument?: (docId: string) => void;
  onDownloadDocument?: (docId: string) => void;
}

export function VerificationCard({
  documentId,
  documentName,
  documentType,
  uploadedAt,
  status,
  rejectionReason,
  onViewDetails,
  onReupload,
  onViewDocument,
  onDownloadDocument,
}: VerificationCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "verified":
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          badgeClass: "bg-green-500/20 text-green-500 border-green-500",
          label: "Verified",
          borderClass: "border-green-500/30",
        };
      case "in-review":
        return {
          icon: <Clock className="w-5 h-5" />,
          badgeClass: "bg-blue-500/20 text-blue-500 border-blue-500",
          label: "In Review",
          borderClass: "border-blue-500/30",
        };
      case "rejected":
        return {
          icon: <XCircle className="w-5 h-5" />,
          badgeClass: "bg-red-500/20 text-red-500 border-red-500",
          label: "Rejected",
          borderClass: "border-red-500/30",
        };
      case "pending":
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          badgeClass: "bg-amber-500/20 text-amber-500 border-amber-500",
          label: "Pending",
          borderClass: "border-amber-500/30",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <Card
      className={cn(
        "p-4 bg-white/5 backdrop-blur-sm border-2 rounded-xl transition-all hover:shadow-lg",
        statusConfig.borderClass
      )}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-purple-400/10 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate" title={documentName}>
                {documentName}
              </h3>
              <p className="text-sm text-gray-400 mt-1">{documentType}</p>
            </div>
          </div>
          <Badge className={cn("ml-2 flex items-center gap-1", statusConfig.badgeClass)}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>

        {/* Upload Date */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Uploaded {formatDate(uploadedAt)}</span>
        </div>

        {/* Rejection Reason */}
        {status === "rejected" && rejectionReason && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Rejection Reason</p>
              <p className="text-sm text-red-300 mt-1">{rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status === "pending" && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-300">
              Your document is in the queue. We'll review it within 24-48 hours.
            </p>
          </div>
        )}

        {status === "in-review" && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-300">
              Our team is currently reviewing your document. This usually takes 1-2 hours.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onViewDetails(documentId)}
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-purple-400/20 hover:border-purple-400/30"
          >
            View Details
          </Button>
          {onViewDocument && (
            <Button
              onClick={() => onViewDocument(documentId)}
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-blue-400/20 hover:border-blue-400/30"
            >
              View
            </Button>
          )}
          {onDownloadDocument && (
            <Button
              onClick={() => onDownloadDocument(documentId)}
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-green-400/20 hover:border-green-400/30"
            >
              Download
            </Button>
          )}
          {status === "rejected" && onReupload && (
            <Button
              onClick={() => onReupload(documentId)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Reupload
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}