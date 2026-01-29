import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Use a test user ID (you can replace this with an actual user ID)
    const testUserId = '00000000-0000-0000-0000-000000000000'
    
    // Create a test notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: testUserId,
        title: '🎉 Test Notification',
        message: 'This is a test popup to verify the notification system is working perfectly!',
        type: 'success',
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
      message: 'Test notification created! Check the student dashboard for the popup!' 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
