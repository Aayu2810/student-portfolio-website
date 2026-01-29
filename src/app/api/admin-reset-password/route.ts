import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json()
    
    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'User ID and new password are required' }, { status: 400 })
    }
    
    console.log('Resetting password for user:', userId)
    
    // Reset the user's password using service role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )
    
    if (error) {
      console.error('Password reset error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('Password reset successful for:', data.user?.email)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        newPassword: newPassword
      }
    })
    
  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
