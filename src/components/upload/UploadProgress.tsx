"use client";

import { CheckCircle, XCircle, Loader2, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  fileName: string;
  fileSize: number;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  error?: string;
  showIcon?: boolean;
  compact?: boolean;
}

export function UploadProgress({
  fileName,
  fileSize,
  progress,
  status,
  error,
  showIcon = true,
  compact = false,
}: UploadProgressProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusConfig = () => {
    switch (status) {
      case "uploading":
        return {
          icon: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
          color: "bg-blue-500",
          textColor: "text-blue-400",
          label: `Uploading ${progress}%`,
        };
      case "success":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          color: "bg-green-500",
          textColor: "text-green-400",
          label: "Upload Complete",
        };
      case "error":
        return {
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          color: "bg-red-500",
          textColor: "text-red-400",
          label: "Upload Failed",
        };
      default:
        return {
          icon: <Upload className="w-5 h-5 text-gray-400" />,
          color: "bg-gray-500",
          textColor: "text-gray-400",
          label: "Ready to Upload",
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        {showIcon && config.icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{fileName}</p>
          {status === "uploading" && (
            <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-300", config.color)}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <span className={cn("text-xs font-medium", config.textColor)}>
          {status === "uploading" ? `${progress}%` : config.label}
        </span>
      </div>
    );
  }

  return (
    <Card className="p-4 bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {showIcon && <div className="mt-0.5">{config.icon}</div>}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{fileName}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatFileSize(fileSize)}
              </p>
            </div>
          </div>
          <span className={cn("text-sm font-medium whitespace-nowrap", config.textColor)}>
            {config.label}
          </span>
        </div>

        {/* Progress Bar */}
        {status === "uploading" && (
          <div className="space-y-1">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  config.color
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {formatFileSize((fileSize * progress) / 100)} of{" "}
                {formatFileSize(fileSize)}
              </span>
              <span className={config.textColor}>{progress}%</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {status === "success" && (
          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs text-green-400">
              File uploaded successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {status === "error" && error && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
}