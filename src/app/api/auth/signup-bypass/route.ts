import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { email, password, firstName, lastName, role = 'student' } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    // Use Supabase signup but immediately confirm email
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      }
    })
    
    if (error) {
      console.error('Signup error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    // Immediately confirm the email to bypass verification
    if (data.user && !data.session) {
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        data.user.id,
        { email_confirm: true }
      )
      
      if (confirmError) {
        console.error('Email confirmation error:', confirmError)
      }
    }
    
    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully! You can now login.',
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        firstName: firstName,
        lastName: lastName,
        role: role
      } : null
    })
    
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
