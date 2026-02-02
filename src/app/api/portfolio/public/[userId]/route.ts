import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createClient()
    const userId = params.userId

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get public portfolio by user ID
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .single()

    if (error) {
      console.error('Error fetching public portfolio:', error)
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found or not public' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      portfolio: {
        title: portfolio.title,
        tagline: portfolio.tagline,
        about: portfolio.about,
        skills: portfolio.skills,
        theme: portfolio.theme,
        custom_domain: portfolio.custom_domain,
        is_public: portfolio.is_public,
        enable_qr_code: portfolio.enable_qr_code,
      }
    })

  } catch (error) {
    console.error('Public portfolio GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
