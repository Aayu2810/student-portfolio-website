import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Create a profile for the specific user ID we saw
    const userId = '3a47cdc8-a10a-4bc3-b1b1-446362342e3f'
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: 'student@example.com',
        first_name: 'Test',
        last_name: 'Student',
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile created successfully',
      profile 
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
