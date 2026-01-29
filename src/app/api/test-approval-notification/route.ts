import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the first user for testing
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 })
    }
    
    const userId = users[0].id
    
    // Create a test approval notification
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Document Approved! 🎉',
        message: 'Your document "Test Document.pdf" has been approved by faculty and is now public.',
        type: 'success',
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating approval notification:', error)
      return NextResponse.json({ error: 'Failed to create approval notification' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Approval notification created! Check the student dashboard for the green popup!' 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
