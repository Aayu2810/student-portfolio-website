import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { share_link_id } = await request.json()

    if (!share_link_id) {
      return NextResponse.json({ error: 'Share link ID required' }, { status: 400 })
    }

    // Increment access count
    const { data, error } = await supabase
      .from('share_links')
      .update({ 
        access_count: supabase.rpc('increment_access_count', { 
          link_id: share_link_id 
        })
      })
      .eq('id', share_link_id)
      .select()
      .single()

    if (error) {
      // Fallback: manually increment if RPC doesn't work
      const { data: currentLink } = await supabase
        .from('share_links')
        .select('access_count')
        .eq('id', share_link_id)
        .single()

      const { data: updatedLink } = await supabase
        .from('share_links')
        .update({ access_count: (currentLink?.access_count || 0) + 1 })
        .eq('id', share_link_id)
        .select()
        .single()

      return NextResponse.json({ success: true, access_count: updatedLink?.access_count })
    }

    return NextResponse.json({ success: true, access_count: data?.access_count })
  } catch (error) {
    console.error('Access tracking error:', error)
    return NextResponse.json({ error: 'Failed to track access' }, { status: 500 })
  }
}
