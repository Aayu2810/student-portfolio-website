import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { email, password, firstName, lastName, role = 'student' } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    // Hash password using crypto (built-in)
    const crypto = require('crypto')
    const hashedPassword = crypto.createHash('sha256').update(password + 'salt').digest('hex')
    
    // Create user directly in auth.users without email verification
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .insert({
        email: email,
        encrypted_password: hashedPassword,
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        raw_user_meta_data: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      })
      .select('id')
      .single()
    
    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userData.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the request if profile creation fails
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully! You can now login.',
      user: {
        id: userData.id,
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: role
      }
    })
    
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
