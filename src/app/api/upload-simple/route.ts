import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
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

    const allowedCategories = ['resume', 'certificate', 'transcript', 'project', 'other'];
    const validCategory = allowedCategories.includes(category) ? category : 'other';

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used, storage_limit')
      .eq('id', user.id)
      .single()

    if (profile && (profile.storage_used + file.size) > profile.storage_limit) {
      return NextResponse.json({ error: 'Storage limit exceeded' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

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
      await supabase.storage.from('documents').remove([filePath])
      return NextResponse.json({ error: 'Failed to save document' }, { status: 500 })
    }

    await supabase
      .from('profiles')
      .update({ 
        storage_used: (profile?.storage_used || 0) + file.size 
      })
      .eq('id', user.id)

    return NextResponse.json({ success: true, document }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
