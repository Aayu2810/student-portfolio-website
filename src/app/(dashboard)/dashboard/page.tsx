'use client'

import { useEffect, useState } from 'react'
import { FileText, CheckCircle, Share2, Eye } from 'lucide-react'
import { useDocuments } from '../../../hooks/useDocuments'
import { useUser } from '../../../hooks/useUser'
import { createClient } from '../../../lib/supabase/client'
import Link from 'next/link'

export default function DashboardPage() {
  const { documents, loading } = useDocuments()
  const { user, profile } = useUser()
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {profile?.first_name || 'User'}!
          </h1>
          <p className="text-gray-400 text-lg">Here's your overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all hover:transform hover:scale-105"
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

        {/* Recent Documents Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">Recent Documents</h2>
            <Link
              href="/documents"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          
          {recentDocs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-gray-400 mb-6 text-lg">No documents yet</p>
              <Link
                href="/documents"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href="/documents"
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate group-hover:text-purple-300 transition-colors">
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-gray-400 text-sm">{doc.category}</span>
                        {doc.is_public && (
                          <span className="flex items-center gap-1 text-green-400 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-gray-500 text-xs whitespace-nowrap">
                      {new Date(doc.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {doc.views} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}