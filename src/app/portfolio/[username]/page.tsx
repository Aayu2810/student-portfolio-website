'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Share2 } from 'lucide-react'

interface PortfolioData {
  title: string
  tagline: string
  about: string
  skills: string[]
  theme: string
  custom_domain?: string
  is_public: boolean
  enable_qr_code: boolean
}

export default function UserPortfolioPage() {
  const params = useParams()
  const username = params?.username as string
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!username) {
        setError('Invalid portfolio URL')
        setLoading(false)
        return
      }

      try {
        // For demo purposes, show a sample portfolio
        // In a real implementation, this would fetch from a database
        const demoPortfolio: PortfolioData = {
          title: 'John Doe\'s Portfolio',
          tagline: 'Full Stack Developer & UI/UX Designer',
          about: 'Passionate developer with 5+ years of experience building modern web applications. Specialized in React, Node.js, and cloud technologies. Love creating intuitive user experiences and solving complex problems.',
          skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker', 'UI/UX Design'],
          theme: 'modern',
          custom_domain: 'john-doe.dev',
          is_public: true,
          enable_qr_code: true
        }
        
        setPortfolio(demoPortfolio)
      } catch (err) {
        setError('Failed to load portfolio')
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [username])

  const sharePortfolio = async () => {
    if (!portfolio) return
    
    const shareUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: portfolio.title,
          text: portfolio.tagline,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert('Portfolio link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl border border-red-800 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'This portfolio is not available or not public.'}</p>
          <Button onClick={() => window.history.back()} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={sharePortfolio}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">{portfolio.title}</h1>
          <p className="text-2xl text-purple-400 mb-8">{portfolio.tagline}</p>
          
          <div className="w-32 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mb-8"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* About Section */}
          <div className="md:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">About Me</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {portfolio.about}
              </p>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400">
          <p className="mb-4">Built with CampusCred Portfolio Builder</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm">Theme: {portfolio.theme}</span>
            {portfolio.custom_domain && (
              <>
                <span className="text-sm">•</span>
                <span className="text-sm">Custom Domain: {portfolio.custom_domain}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}