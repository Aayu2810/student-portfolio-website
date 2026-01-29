import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { userId, newPassword } = await request.json()
    
    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'User ID and new password are required' }, { status: 400 })
    }
    
    // Reset the user's password using admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )
    
    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    })
    
  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
