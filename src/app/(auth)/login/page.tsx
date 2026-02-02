'use client'

import { useState } from 'react'
import { getSupabaseClient } from '../../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Use singleton client for consistent auth state
const supabase = getSupabaseClient()

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      // Verify session exists before navigating
      // This ensures the auth state is fully synchronized
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error('[Login] Session verification failed:', sessionError)
        setError('Login succeeded but session not established. Please try again.')
        setLoading(false)
        return
      }

      console.log('[Login] Session verified, redirecting to dashboard')

      // Refresh to ensure middleware sees the new session
      router.refresh()
      router.push('/dashboard')
    } catch (err: any) {
      console.error('[Login] Error:', err)
      setError(err.message || 'An error occurred during login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 px-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your CampusCred account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your.email@rvce.edu.in"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Create one
              </Link>
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Faculty?{' '}
              <Link href="/faculty-login" className="text-purple-400 hover:text-purple-300 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
