import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate category against allowed values
    const allowedCategories = ['resume', 'certificate', 'transcript', 'project', 'other'];
    const validCategory = allowedCategories.includes(category) ? category : 'other';

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB' }, { status: 400 })
    }

    // Check storage limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used, storage_limit')
      .eq('id', user.id)
      .single()

    if (profile && (profile.storage_used + file.size) > profile.storage_limit) {
      return NextResponse.json({ error: 'Storage limit exceeded' }, { status: 400 })
    }

    // Create unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Insert document record - using RPC or bypass RLS if needed
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: title || file.name,
        description: description || null,
        category: validCategory,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        file_url: publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
        is_public: false,
        is_favorite: false,
        views: 0,
        downloads: 0,
        thumbnail_url: null
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Check if it's a constraint violation or other error
      console.error('Error details:', dbError.details, dbError.message, dbError.code)
      // Check if this is an RLS error
      if (dbError.code === '42501' || dbError.message.includes('permission') || dbError.message.includes('RLS')) {
        console.error('This appears to be an RLS permission error');
      }
      // Cleanup uploaded file
      await supabase.storage.from('documents').remove([filePath])
      return NextResponse.json({ error: `Failed to save document record: ${dbError.message}` }, { status: 500 })
    }

    // Update storage usage
    await supabase
      .from('profiles')
      .update({ 
        storage_used: (profile?.storage_used || 0) + file.size 
      })
      .eq('id', user.id)

    return NextResponse.json({ 
      success: true, 
      document 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get pagination parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    const { data: documents, error, count } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const response = NextResponse.json({ 
      documents, 
      pagination: { 
        page, 
        limit, 
        total: count,
        hasMore: offset + limit < (count || 0)
      } 
    }, { status: 200 });
    
    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}