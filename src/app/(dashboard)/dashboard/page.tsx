'use client'

import { useEffect, useState } from 'react'
import { FileText, CheckCircle, Share2, Eye, Upload, LogOut } from 'lucide-react'
import { useDocuments } from '../../../hooks/useDocuments'
import { useUser } from '../../../hooks/useUser'
import { createClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const { documents, loading } = useDocuments()
  const { user, profile } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [totalShares, setTotalShares] = useState(0)

  useEffect(() => {
    const fetchShares = async () => {
      if (!user) return
      const { data } = await supabase
        .from('share_links')
        .select('id')
        .eq('user_id', user.id)
      setTotalShares(data?.length || 0)
    }
    fetchShares()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const stats = [
    {
      icon: <FileText className="w-8 h-8" />,
      label: 'Total Documents',
      value: documents.length.toString(),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      label: 'Verified',
      value: documents.filter(d => d.is_public).length.toString(),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      label: 'Shared Links',
      value: totalShares.toString(),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Eye className="w-8 h-8" />,
      label: 'Total Views',
      value: documents.reduce((sum, d) => sum + d.views, 0).toString(),
      color: 'from-orange-500 to-red-500'
    }
  ]

  const recentDocs = documents.slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.first_name || 'User'}!
            </h1>
            <p className="text-gray-400">Here's your overview</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.color} mb-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Documents</h2>
            {recentDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No documents uploaded yet</p>
                <Link
                  href="/documents"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{doc.title}</p>
                        <p className="text-gray-400 text-sm">{doc.category}</p>
                      </div>
                    </div>
                    <span className="text-gray-500 text-xs whitespace-nowrap ml-2">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                <Link
                  href="/documents"
                  className="block text-center py-2 text-purple-400 hover:text-purple-300 text-sm"
                >
                  View All Documents →
                </Link>
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/documents"
                className="block w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-all"
              >
                📤 Upload New Document
              </Link>
              <Link
                href="/documents"
                className="block w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-all"
              >
                📋 View All Documents
              </Link>
              <Link
                href="/portfolio"
                className="block w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-all"
              >
                🎨 Build Portfolio
              </Link>
              <Link
                href="/profile"
                className="block w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg text-white transition-all"
              >
                👤 Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}