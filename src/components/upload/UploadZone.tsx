"use client";

import { useCallback, useState } from "react";
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "complete" | "error";
  error?: string;
}

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  maxFiles?: number;
  multiple?: boolean;
  showPreview?: boolean;
}

export function UploadZone({
  onUpload,
  maxSize = 10,
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  maxFiles = 5,
  multiple = true,
  showPreview = true,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max ${maxSize}MB)`);
        return;
      }

      // Check file type
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExt)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    if (valid.length > 0) {
      // Create upload file objects
      const newFiles: UploadedFile[] = valid.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: "uploading",
      }));

      setUploadedFiles([...uploadedFiles, ...newFiles]);

      // Simulate upload progress
      newFiles.forEach((uploadFile) => {
        const interval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    progress: Math.min(f.progress + 10, 100),
                    status: f.progress >= 90 ? "complete" : "uploading",
                  }
                : f
            )
          );
        }, 200);

        setTimeout(() => {
          clearInterval(interval);
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id ? { ...f, progress: 100, status: "complete" } : f
            )
          );
        }, 2000);
      });

      onUpload(valid);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [uploadedFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
      return <ImageIcon className="w-5 h-5 text-purple-400" />;
    }
    return <FileText className="w-5 h-5 text-purple-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={cn(
          "relative p-8 border-2 border-dashed transition-all",
          "bg-white/5 backdrop-blur-sm cursor-pointer",
          isDragging
            ? "border-purple-400 bg-purple-400/10 scale-[1.02]"
            : "border-white/20 hover:border-purple-400/50 hover:bg-white/10"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center text-center space-y-4">
          <div
            className={cn(
              "p-4 rounded-full transition-all",
              isDragging ? "bg-purple-400/20 scale-110" : "bg-purple-400/10"
            )}
          >
            <Upload
              className={cn(
                "w-8 h-8 text-purple-400 transition-transform",
                isDragging && "animate-bounce"
              )}
            />
          </div>

          <div>
            <p className="text-lg font-semibold text-white">
              {isDragging ? "Drop files here!" : "Drop files here or click to upload"}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {acceptedTypes.length > 0 
                ? `Supports: ${acceptedTypes.join(", ")}`
                : "All file types accepted"
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max file size: {maxSize}MB • Max {maxFiles} files
            </p>
          </div>

          {!isDragging && (
            <Button
              type="button"
              variant="outline"
              className="border-white/10 hover:bg-purple-400/20 hover:border-purple-400/30"
            >
              Choose Files
            </Button>
          )}
        </div>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">
              Uploaded Files ({uploadedFiles.length}/{maxFiles})
            </p>
            {uploadedFiles.every((f) => f.status === "complete") && (
              <Button
                onClick={() => setUploadedFiles([])}
                variant="ghost"
                size="sm"
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear All
              </Button>
            )}
          </div>

          {uploadedFiles.map((uploadFile) => (
            <Card
              key={uploadFile.id}
              className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-400/10 rounded-lg">
                  {getFileIcon(uploadFile.file.name)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-400 ml-2">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  {uploadFile.status === "uploading" && (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all duration-300 rounded-full"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        Uploading... {uploadFile.progress}%
                      </p>
                    </div>
                  )}

                  {uploadFile.status === "complete" && (
                    <p className="text-xs text-green-400">Upload complete</p>
                  )}

                  {uploadFile.status === "error" && (
                    <p className="text-xs text-red-400">
                      {uploadFile.error || "Upload failed"}
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex items-center gap-2">
                  {uploadFile.status === "complete" && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {uploadFile.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}

                  {/* Remove Button */}
                  <Button
                    onClick={() => removeFile(uploadFile.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}