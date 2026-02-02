// Single Document API - DELETE/GET single document

import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  try {
    const { docId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the document from the database
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', docId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching document:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Increment the view count
    await supabase
      .from('documents')
      .update({ views: (document.views || 0) + 1 })
      .eq('id', docId)

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  try {
    const { docId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the document to get its storage path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path, file_size')
      .eq('id', docId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete the file from storage
    if (document.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        return NextResponse.json({ 
          error: 'Failed to delete file from storage. Please try again.' 
        }, { status: 500 })
      }
    }

    // Delete the document from the database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', docId)
      .eq('user_id', user.id)

    if (dbError) {
      console.error('Error deleting document from database:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Update storage usage - decrement the file size
    if (document.file_size) {
      const { error: storageUpdateError } = await supabase.rpc('decrement_storage', { 
        user_id_param: user.id, 
        bytes: document.file_size 
      })
      
      if (storageUpdateError) {
        console.error('Error updating storage:', storageUpdateError)
        // Non-critical, continue anyway
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ docId: string }> }) {
  try {
    const { docId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Update the document in the database and return the updated document
    const { data: document, error } = await supabase
      .from('documents')
      .update(data)
      .eq('id', docId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating document:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}