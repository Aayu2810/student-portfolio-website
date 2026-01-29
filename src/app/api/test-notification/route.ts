import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, message, type } = await request.json()

    // Create a test notification for the current user
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: title || 'Test Notification',
        message: message || 'This is a test notification',
        type: type || 'info',
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating test notification:', error)
      return NextResponse.json({ error: 'Failed to create test notification' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Test notification created successfully!' 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
