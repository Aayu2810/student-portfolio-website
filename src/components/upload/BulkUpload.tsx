"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trash2, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
}

interface BulkUploadProps {
  files: UploadFile[];
  onUploadAll: () => void;
  onRemoveFile: (fileId: string) => void;
  onRemoveSelected: (fileIds: string[]) => void;
  onClearAll: () => void;
}

export function BulkUpload({
  files,
  onUploadAll,
  onRemoveFile,
  onRemoveSelected,
  onClearAll,
}: BulkUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const toggleSelectFile = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((f) => f.id));
    }
  };

  const handleRemoveSelected = () => {
    onRemoveSelected(selectedFiles);
    setSelectedFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getStatusColor = (status: UploadFile["status"]) => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "uploading":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  if (files.length === 0) {
    return (
      <Card className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No files selected for upload</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <Card className="p-4 bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedFiles.length === files.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-white font-medium">
                Select All ({files.length})
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                Pending: <span className="text-white">{pendingCount}</span>
              </span>
              <span className="text-gray-400">
                Success: <span className="text-green-400">{successCount}</span>
              </span>
              <span className="text-gray-400">
                Failed: <span className="text-red-400">{errorCount}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedFiles.length > 0 && (
              <Button
                onClick={handleRemoveSelected}
                variant="outline"
                size="sm"
                className="border-red-500/20 hover:bg-red-500/10 text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Selected ({selectedFiles.length})
              </Button>
            )}

            {pendingCount > 0 && (
              <Button
                onClick={onUploadAll}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload All ({pendingCount})
              </Button>
            )}

            <Button
              onClick={onClearAll}
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/10"
            >
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* Files List */}
      <div className="space-y-2">
        {files.map((file) => (
          <Card
            key={file.id}
            className={cn(
              "p-4 bg-white/5 backdrop-blur-sm border transition-colors",
              selectedFiles.includes(file.id)
                ? "border-purple-500/50 bg-purple-500/10"
                : "border-white/10 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedFiles.includes(file.id)}
                onCheckedChange={() => toggleSelectFile(file.id)}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        getStatusColor(file.status)
                      )}
                    >
                      {file.status === "pending" && "Pending"}
                      {file.status === "uploading" &&
                        `Uploading ${file.progress}%`}
                      {file.status === "success" && "Uploaded"}
                      {file.status === "error" && "Failed"}
                    </span>

                    {file.status === "success" && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {file.status === "error" && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}

                    <Button
                      onClick={() => onRemoveFile(file.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                {file.status === "uploading" && (
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {file.status === "error" && file.error && (
                  <p className="text-xs text-red-400 mt-1">{file.error}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
