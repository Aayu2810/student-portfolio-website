import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all documents to find user IDs
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('user_id')
    
    if (docsError) {
      return NextResponse.json({ error: docsError.message }, { status: 500 })
    }
    
    // Get unique user IDs
    const uniqueUserIds = Array.from(new Set(documents?.map(doc => doc.user_id) || []))
    
    // Try to get auth users (this might not work due to permissions)
    let profilesToCreate: any[] = []
    
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data')
        .in('id', uniqueUserIds)
      
      if (!authError && authUsers) {
        profilesToCreate = authUsers.map(user => ({
          id: user.id,
          email: user.email,
          first_name: user.raw_user_meta_data?.first_name || user.email?.split('@')[0] || 'Unknown',
          last_name: user.raw_user_meta_data?.last_name || '',
          role: user.raw_user_meta_data?.role || 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      }
    } catch (error) {
      console.log('Could not access auth.users, creating dummy profiles')
      // Create dummy profiles with user IDs
      profilesToCreate = uniqueUserIds.map((userId, index) => ({
        id: userId,
        email: `user${index + 1}@example.com`,
        first_name: `User${index + 1}`,
        last_name: 'Test',
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
    }
    
    // Insert profiles
    if (profilesToCreate.length > 0) {
      const { data: insertedProfiles, error: insertError } = await supabase
        .from('profiles')
        .upsert(profilesToCreate, { onConflict: 'id' })
        .select()
      
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Created ${profilesToCreate.length} profiles`,
        profiles: insertedProfiles 
      })
    }
    
    return NextResponse.json({ success: true, message: 'No profiles to create' })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
