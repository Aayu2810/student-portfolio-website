import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching portfolio:', error)
      return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      portfolio: portfolio || null 
    })

  } catch (error) {
    console.error('Portfolio GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolioData = await request.json()
    const { title, tagline, about, skills, theme, customDomain, isPublic, enableQRCode } = portfolioData

    // Validate required fields
    if (!title || !tagline || !about) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if portfolio already exists
    const { data: existingPortfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result
    if (existingPortfolio) {
      // Update existing portfolio
      result = await supabase
        .from('portfolios')
        .update({
          title,
          tagline,
          about,
          skills,
          theme,
          custom_domain: customDomain,
          is_public: isPublic,
          enable_qr_code: enableQRCode,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Create new portfolio
      result = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          title,
          tagline,
          about,
          skills,
          theme,
          custom_domain: customDomain,
          is_public: isPublic,
          enable_qr_code: enableQRCode
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving portfolio:', result.error)
      return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      portfolio: result.data 
    })

  } catch (error) {
    console.error('Portfolio POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
