"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UploadPopup } from "./UploadPopup";
import { AccessControlModal, AccessSettings } from "./AccessControlModal";

interface UploadStatus {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  errorMessage?: string;
}

interface PendingFile {
  file: File;
  accessSettings?: AccessSettings;
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
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

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
        errors.push(`File too large (max ${maxSize}MB)`);
        return;
      }

      // Check file type
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(fileExt)) {
        errors.push(`File type not supported`);
        return;
      }

      // Simulate file corruption check (random 10% chance)
      if (Math.random() < 0.1) {
        errors.push(`File appears to be corrupted`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const simulateUpload = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      let progress = 0;
      
      setUploadStatus({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });
      setIsPopupOpen(true);

      const interval = setInterval(() => {
        progress += Math.random() * 15;
        
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate network failure (10% chance)
          if (Math.random() < 0.1) {
            setUploadStatus({
              fileName: file.name,
              progress: 100,
              status: 'error',
              errorMessage: 'Network connection lost. Please check your internet connection and try again.'
            });
            reject(new Error('Network error'));
          } else {
            setUploadStatus({
              fileName: file.name,
              progress: 100,
              status: 'success'
            });
            resolve();
          }
        } else {
          setUploadStatus({
            fileName: file.name,
            progress: Math.floor(progress),
            status: 'uploading'
          });
        }
      }, 200);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      const errorType = errors[0].includes('too large') 
        ? 'File size exceeds limit' 
        : errors[0].includes('not supported')
        ? 'Invalid file type'
        : 'File corrupted or invalid';
      
      setUploadStatus({
        fileName: fileArray[0].name,
        progress: 0,
        status: 'error',
        errorMessage: `${errorType}: ${errors[0]}`
      });
      setIsPopupOpen(true);
      return;
    }

    if (valid.length > 0) {
      // Show access control modal for first file
      setPendingFiles(valid);
      setCurrentFileIndex(0);
      setIsAccessModalOpen(true);
    }
  };

  const handleAccessConfirm = async (settings: AccessSettings) => {
    setIsAccessModalOpen(false);
    
    const currentFile = pendingFiles[currentFileIndex];
    
    try {
      await simulateUpload(currentFile);
      onUpload([currentFile]);
      
      // Check if there are more files
      if (currentFileIndex < pendingFiles.length - 1) {
        // Wait a bit before showing next file's access modal
        await new Promise(resolve => setTimeout(resolve, 500));
        setCurrentFileIndex(currentFileIndex + 1);
        setIsAccessModalOpen(true);
      } else {
        // All files uploaded
        setPendingFiles([]);
        setCurrentFileIndex(0);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // Reset on error
      setPendingFiles([]);
      setCurrentFileIndex(0);
    }
  };

  const handleAccessCancel = () => {
    setIsAccessModalOpen(false);
    setPendingFiles([]);
    setCurrentFileIndex(0);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    []
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setUploadStatus(null);
  };

  return (
    <>
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
                Max file size: {maxSize}MB • Upload multiple files at once
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
      </div>

      {/* Upload Popup */}
      {uploadStatus && (
        <UploadPopup
          isOpen={isPopupOpen}
          fileName={uploadStatus.fileName}
          progress={uploadStatus.progress}
          status={uploadStatus.status}
          errorMessage={uploadStatus.errorMessage}
          onClose={handleClosePopup}
        />
      )}

      {/* Access Control Modal */}
      {pendingFiles.length > 0 && (
        <AccessControlModal
          isOpen={isAccessModalOpen}
          fileName={pendingFiles[currentFileIndex]?.name || ''}
          onConfirm={handleAccessConfirm}
          onCancel={handleAccessCancel}
        />
      )}
    </>
  );
}