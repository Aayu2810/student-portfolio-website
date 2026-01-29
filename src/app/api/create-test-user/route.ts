import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Create a new test user with known credentials
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'teststudent@campuscred.com',
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'Student',
        role: 'student'
      }
    })
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Create profile for the new user
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          first_name: 'Test',
          last_name: 'Student',
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test user created successfully',
      user: {
        email: 'teststudent@campuscred.com',
        password: 'test123456',
        user_id: data.user?.id
      }
    })
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
