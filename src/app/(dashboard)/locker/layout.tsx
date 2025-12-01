'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Search, Grid, List, Upload, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function LockerLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  
  // We need to access the parent component's state to open the modal
  // For now, we'll just show an alert
  const handleCreateFolder = () => {
    alert('Create folder functionality would open here')
  }
  
  const handleUpload = () => {
    // Try to find and trigger the upload modal in the child component
    // This is a workaround since we can't directly access the child's state
    const event = new CustomEvent('openUploadModal');
    window.dispatchEvent(event);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Locker Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Digital Locker</h1>
              <p className="text-[#d1d5db] mt-2">Store, organize, and share your academic documents securely</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleCreateFolder}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-[0_8px_32px_rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)]"
              >
                <FolderPlus className="w-5 h-5" />
                <span>Create Folder</span>
              </Button>
              <Button 
                onClick={handleUpload}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-[0_8px_32px_rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.4)]"
              >
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af] w-5 h-5" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-3 bg-[rgba(255,255,255,0.08)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#f9fafb] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-[rgba(139,92,246,0.3)] transition-all duration-300"
            />
          </div>
        </div>
        
        {children}
      </div>
    </div>
  )
}
