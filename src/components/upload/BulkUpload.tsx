import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import UploadZone from './UploadZone';
import DocumentCategory, { DocumentCategory as CategoryType } from './DocumentCategory';
import UploadProgress from './UploadProgress';

interface FileWithCategory {
  file: File;
  category: CategoryType | null;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface BulkUploadProps {
  onClose: () => void;
  onUploadComplete: (files: FileWithCategory[]) => void;
}

const BulkUpload = ({ onClose, onUploadComplete }: BulkUploadProps) => {
  const [files, setFiles] = useState<FileWithCategory[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    const filesWithMeta: FileWithCategory[] = newFiles.map((file) => ({
      file,
      category: null,
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev: FileWithCategory[]) => [...prev, ...filesWithMeta]);
  };

  const removeFile = (index: number) => {
    setFiles((prev: FileWithCategory[]) =>
      prev.filter((_, i: number) => i !== index)
    );
  };

  const updateCategory = (index: number, category: CategoryType) => {
    setFiles((prev: FileWithCategory[]) =>
      prev.map((f: FileWithCategory, i: number) =>
        i === index ? { ...f, category } : f
      )
    );
  };

  const simulateUpload = async (file: FileWithCategory, index: number) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setFiles((prev: FileWithCategory[]) =>
        prev.map((f: FileWithCategory, i: number) =>
          i === index
            ? { ...f, progress, status: 'uploading' as const }
            : f
        )
      );
    }

    // Mark as success
    setFiles((prev: FileWithCategory[]) =>
      prev.map((f: FileWithCategory, i: number) =>
        i === index ? { ...f, status: 'success' as const } : f
      )
    );
  };

  const handleUpload = async () => {
    const filesWithoutCategory = files.filter(
      (f: FileWithCategory) => !f.category
    );
    if (filesWithoutCategory.length > 0) {
      alert('Please select a category for all files');
      return;
    }

    setIsUploading(true);

    // Upload all files
    await Promise.all(
      files.map((file: FileWithCategory, index: number) =>
        simulateUpload(file, index)
      )
    );

    setIsUploading(false);
    onUploadComplete(files);
  };

  const allCategoriesSelected = files.every(
    (f: FileWithCategory) => f.category !== null
  );
  const hasFiles = files.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a2e] border border-[#a78bfa]/30 shadow-2xl shadow-[#a78bfa]/20">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#1a1a2e]/95 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold text-[#f9fafb]">Bulk Upload</h2>
            <p className="mt-1 text-sm text-[#9ca3af]">
              Upload multiple documents at once
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-[#d1d5db]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Zone */}
          {!isUploading && (
            <UploadZone onFilesSelected={handleFilesSelected} multiple={true} />
          )}

          {/* Files List */}
          {hasFiles && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#f9fafb]">
                  Files ({files.length})
                </h3>
                {!isUploading && (
                  <button
                    onClick={() => setFiles([])}
                    className="text-sm text-[#9ca3af] hover:text-[#ef4444] transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {files.map((fileItem: FileWithCategory, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-[#a78bfa]/10">
                          <FileText className="w-5 h-5 text-[#a78bfa]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#f9fafb] truncate">
                            {fileItem.file.name}
                          </p>
                          <p className="text-xs text-[#9ca3af]">
                            {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      {fileItem.status === 'success' && (
                        <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                      )}

                      {fileItem.status === 'pending' && !isUploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-[#9ca3af]" />
                        </button>
                      )}
                    </div>

                    {fileItem.status === 'uploading' && (
                      <UploadProgress
                        fileName={fileItem.file.name}
                        progress={fileItem.progress}
                      />
                    )}

                    {fileItem.status === 'pending' && !isUploading && (
                      <DocumentCategory
                        selected={fileItem.category}
                        onSelect={(category: CategoryType) =>
                          updateCategory(index, category)
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-white/10 bg-[#1a1a2e]/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-[#9ca3af]">
              {files.length} file{files.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isUploading}
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#f9fafb] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!allCategoriesSelected || !hasFiles || isUploading}
                className="px-6 py-3 rounded-xl bg-[#a78bfa] hover:bg-[#8b5cf6] text-white font-medium transition-all shadow-lg shadow-[#a78bfa]/30 hover:shadow-[#a78bfa]/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;