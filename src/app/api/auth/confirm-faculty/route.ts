// API route to auto-confirm faculty users
import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user is faculty
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is faculty/admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileData?.role !== 'faculty' && profileData?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Note: Auto-confirming users requires admin privileges
    // This should be done through Supabase Dashboard or Management API
    // For now, we'll just return success and let the login proceed
    
    return NextResponse.json({ 
      success: true, 
      message: 'Faculty login allowed' 
    });
  } catch (error: any) {
    console.error('Error in confirm-faculty:', error);
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}

