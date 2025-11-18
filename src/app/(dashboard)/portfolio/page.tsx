'use client'

import { Palette } from 'lucide-react'

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio Builder</h1>
          <p className="text-gray-400">Create your professional portfolio</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-12">
          <div className="text-center max-w-md mx-auto">
            <Palette className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Portfolio Builder Coming Soon
            </h2>
            <p className="text-gray-400 mb-6">
              This feature will be available in Phase 2. You'll be able to create beautiful, verified portfolios from your uploaded documents.
            </p>
            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
              <p className="text-purple-300 text-sm">
                🚀 Features in development:
              </p>
              <ul className="text-gray-300 text-sm mt-2 space-y-1 text-left">
                <li>• Multiple portfolio themes</li>
                <li>• Auto-generated from documents</li>
                <li>• Custom domain support</li>
                <li>• QR code for sharing</li>
                <li>• Analytics tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}