import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, '', options);
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Check user's role for faculty routes
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (authUser) {
    // Fetch user profile to check role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();
    
    const userRole = profileData?.role;
    
    // If accessing faculty routes without faculty role
    if (request.nextUrl.pathname.startsWith('/faculty') && 
        userRole !== 'faculty' && userRole !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/(dashboard)/dashboard';
      return NextResponse.redirect(url);
    }
  }
  
  // If there is no user and the route is protected, redirect to login
  if (!user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/faculty'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
  
  // Redirect faculty users from student verification page
  if (request.nextUrl.pathname.startsWith('/(dashboard)/verification') && 
      user) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileData?.role === 'faculty' || profileData?.role === 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/faculty';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/faculty/:path*', '/login', '/register', '/(dashboard)/verification', '/api/upload'],
}