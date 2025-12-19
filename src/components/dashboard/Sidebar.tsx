'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Lock, 
  Share2, 
  CheckCircle, 
  User, 
  Activity,
  LogOut,
  FolderOpen
} from 'lucide-react'
import { useStorage } from '@/hooks/useStorage'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Sidebar() {
  const pathname = usePathname()
  const { used, total, percentage } = useStorage()
  const { profile } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      href: '/documents',
      label: 'Documents',
      icon: <FileText className="w-5 h-5" />
    },
    {
      href: '/locker',
      label: 'Locker',
      icon: <Lock className="w-5 h-5" />
    },
    {
      href: '/portfolio',
      label: 'Portfolio',
      icon: <FolderOpen className="w-5 h-5" />
    },
    {
      href: '/verification',
      label: 'Verification',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      href: '/audit-logs',
      label: 'Audit Logs',
      icon: <Activity className="w-5 h-5" />
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />
    }
  ]

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <aside className="w-64 h-screen bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 flex flex-col sticky top-0">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {profile?.first_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">
              {profile?.first_name || 'User'}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {profile?.email || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Storage Section (Google Drive Style) */}
      <div className="p-4 border-t border-gray-800">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Storage</span>
            <span className="text-gray-300">
              {formatBytes(used)} of {formatBytes(total)}
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentage > 90
                  ? 'bg-red-500'
                  : percentage > 75
                  ? 'bg-yellow-500'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-500">
            {percentage.toFixed(1)}% used
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}