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

    if (error || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (!portfolio.enable_qr_code) {
      return NextResponse.json({ error: 'QR code sharing is disabled' }, { status: 400 })
    }

    // Generate portfolio URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const portfolioUrl = `${baseUrl}/portfolio/${user.id}`

    // Generate QR code using external service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portfolioUrl)}&format=png`

    return NextResponse.json({ 
      success: true, 
      portfolioUrl,
      qrCodeUrl,
      isPublic: portfolio.is_public
    })

  } catch (error) {
    console.error('QR Code generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
