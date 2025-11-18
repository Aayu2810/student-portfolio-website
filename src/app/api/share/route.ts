import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Generate random share code
function generateShareCode(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { document_ids, expires_in_hours, max_access } = body

    if (!document_ids || !Array.isArray(document_ids) || document_ids.length === 0) {
      return NextResponse.json({ error: 'Invalid document IDs' }, { status: 400 })
    }

    if (document_ids.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 documents can be shared at once' }, { status: 400 })
    }

    // Verify user owns all documents
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id')
      .in('id', document_ids)
      .eq('user_id', user.id)

    if (docError || !documents || documents.length !== document_ids.length) {
      return NextResponse.json({ error: 'Invalid documents' }, { status: 403 })
    }

    // Create share links for each document
    const shareLinks: any[] = []
    const shareCode = generateShareCode()
    
    // Calculate expiration
    let expiresAt: string | null = null
    if (expires_in_hours) {
      expiresAt = new Date(Date.now() + expires_in_hours * 60 * 60 * 1000).toISOString()
    }

    for (const docId of document_ids) {
      const { data: shareLink, error: shareError } = await supabase
        .from('share_links')
        .insert({
          document_id: docId,
          user_id: user.id,
          share_code: `${shareCode}-${docId.substring(0, 8)}`,
          expires_at: expiresAt,
          max_access: max_access || null,
          is_active: true,
          access_count: 0
        })
        .select()
        .single()

      if (shareError) {
        console.error('Share link error:', shareError)
        continue
      }

      if (shareLink) {
        shareLinks.push(shareLink)
      }
    }

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/shared/${shareCode}`

    return NextResponse.json({ 
      success: true,
      share_code: shareCode,
      share_url: shareUrl,
      share_links: shareLinks,
      qr_data: shareUrl,
      expires_at: expiresAt
    }, { status: 200 })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get share link info
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const shareCode = searchParams.get('code')

    if (!shareCode) {
      return NextResponse.json({ error: 'Share code required' }, { status: 400 })
    }

    const { data: shareLinks, error } = await supabase
      .from('share_links')
      .select(`
        *,
        documents:document_id (
          id,
          title,
          description,
          file_url,
          file_name,
          file_type,
          file_size,
          category
        )
      `)
      .like('share_code', `${shareCode}%`)
      .eq('is_active', true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!shareLinks || shareLinks.length === 0) {
      return NextResponse.json({ error: 'Share link not found or expired' }, { status: 404 })
    }

    // Check expiration
    const now = new Date()
    const validLinks = shareLinks.filter(link => {
      if (link.expires_at && new Date(link.expires_at) < now) {
        return false
      }
      if (link.max_access && link.access_count >= link.max_access) {
        return false
      }
      return true
    })

    if (validLinks.length === 0) {
      return NextResponse.json({ error: 'All links have expired or reached access limit' }, { status: 410 })
    }

    return NextResponse.json({ 
      share_links: validLinks
    }, { status: 200 })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}