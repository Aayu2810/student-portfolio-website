import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    // Check documents with profiles
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        user_id,
        profiles!documents_user_id_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .limit(3)

    return NextResponse.json({
      profiles: profiles,
      profilesError: profilesError,
      documents: documents,
      docsError: docsError
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message })
  }
}
