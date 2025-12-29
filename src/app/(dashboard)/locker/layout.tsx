'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Search, Grid, List, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function LockerLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const handleUpload = () => {
    // Try to find and trigger the upload modal in the child component
    // This is a workaround since we can't directly access the child's state
    const event = new CustomEvent('openUploadModal');
    window.dispatchEvent(event);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  )
}
