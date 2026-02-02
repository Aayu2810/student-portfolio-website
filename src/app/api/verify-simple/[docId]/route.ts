import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ docId: string }> }) {
  try {
    const { docId } = await params
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check faculty role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || (profile.role !== 'faculty' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { action, reason } = await request.json()
    console.log('Simple verify API:', { docId, action, reason })

    // Get document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (action === 'verify') {
      // Approve document
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          is_public: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', docId)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json({ error: 'Failed to approve document' }, { status: 500 })
      }

      // Send notification to document owner
      try {
        const documentTitle = document.title || document.document_title || 'Unknown Document'
        console.log('Creating approval notification for document:', documentTitle)
        
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: document.user_id,
            title: 'Document Approved! 🎉',
            message: `Your document "${documentTitle}" has been approved by faculty and is now public.`,
            type: 'success',
            read: false,
            created_at: new Date().toISOString()
          })
        
        if (notificationError) {
          console.error('Error creating approval notification:', notificationError)
        } else {
          console.log('Approval notification sent to student:', document.user_id, 'for document:', documentTitle)
        }
      } catch (notifError) {
        console.error('Notification system error:', notifError)
        // Don't fail the request if notification fails
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Document approved successfully' 
      })

    } else if (action === 'reject') {
      if (!reason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
      }

      // Reject document - add a rejection record to track it
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          is_public: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', docId)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json({ error: 'Failed to reject document' }, { status: 500 })
      }

      // Add rejection record to track rejections (if table exists)
      try {
        await supabase
          .from('document_rejections')
          .upsert({
            document_id: docId,
            rejected_by: user.id,
            rejection_reason: reason,
            rejected_at: new Date().toISOString()
          }, {
            onConflict: 'document_id'
          })
      } catch (rejectionError) {
        console.log('Rejection table not found, rejection not tracked but document updated');
        // Don't fail the request if rejection tracking fails
      }

      // Send notification to document owner
      try {
        const documentTitle = document.title || document.document_title || 'Unknown Document'
        console.log('Creating rejection notification for document:', documentTitle)
        
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: document.user_id,
            title: 'Document Rejected ❌',
            message: `Your document "${documentTitle}" has been rejected by faculty. Reason: ${reason}`,
            type: 'error',
            read: false,
            created_at: new Date().toISOString()
          })
        
        if (notificationError) {
          console.error('Error creating rejection notification:', notificationError)
        } else {
          console.log('Rejection notification sent to student:', document.user_id, 'for document:', documentTitle)
        }
      } catch (notifError) {
        console.error('Notification system error:', notifError)
        // Don't fail the request if notification fails
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Document rejected successfully' 
      })

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Simple verify error:', error)
    return NextResponse.json({ 
      error: error.message || 'Verification failed' 
    }, { status: 500 })
  }
}
