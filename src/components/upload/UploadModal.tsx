'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { UploadZone } from './UploadZone';
import { Button } from '@/components/ui/button';
import { DocumentCategory } from './DocumentCategory';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], category: string) => void;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('other');

  const handleUpload = (files: File[]) => {
    // Pass the selected category along with the files
    onUpload(files, selectedCategory);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Upload Documents</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Document Category */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Document Category</h3>
            <DocumentCategory
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Upload Zone */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Select Files</h3>
            <UploadZone 
              onUpload={handleUpload} 
              maxSize={50} 
              maxFiles={5} 
              multiple={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}