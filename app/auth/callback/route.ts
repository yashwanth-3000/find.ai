import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  // Default redirect to role-selector to ensure new users choose a role
  const next = requestUrl.searchParams.get('next') || '/role-selector'
  
  console.log('Auth callback received with:', {
    code: code ? 'exists' : 'missing',
    error: error || 'none',
    url: req.url,
    hasHash: req.url.includes('#'),
    searchParams: Object.fromEntries(requestUrl.searchParams.entries())
  })
  
  // If the host is localhost but we're in production, redirect to the production domain
  const isLocalhost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1'
  const isProd = process.env.NODE_ENV === 'production'
  const prodUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findr-ai.vercel.app'
  
  if (isProd && isLocalhost) {
    console.log('Detected localhost in production, redirecting to:', prodUrl)
    // Preserve all query parameters and hash
    const targetUrl = new URL(requestUrl.pathname, prodUrl)
    requestUrl.searchParams.forEach((value, key) => {
      targetUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(targetUrl)
  }

  // Handle explicit errors from OAuth provider
  if (error) {
    console.error('OAuth provider returned error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    )
  }

  // Check for URL fragment with access_token (implicit flow)
  // This happens when the OAuth provider returns token directly in URL fragment
  if (req.url.includes('#') || req.url.includes('access_token=')) {
    console.log('Detected URL fragment or token parameter - handling in client-side component')
    
    // We need to redirect to a client-side page that can handle the fragment
    // since server components can't access URL fragments
    return NextResponse.redirect(
      new URL('/auth/token-handler', requestUrl.origin)
    )
  }
  
  // Helper to create a response with auth cookies and an auth redirect flag
  const createAuthRedirectResponse = (targetUrl: string) => {
    const url = new URL(targetUrl, requestUrl.origin)
    
    // Add the auth_redirect=true flag to bypass middleware checks temporarily
    url.searchParams.set('auth_redirect', 'true')
    
    // Create the response object
    const response = NextResponse.redirect(url)
    
    // Set a cookie indicating auth is in progress (helps middleware)
    response.cookies.set('auth_in_progress', 'true', { 
      maxAge: 30, // Extend to 30 seconds to account for possible delays
      path: '/',
      sameSite: 'lax'
    })
    
    return response
  }
  
  // Handle explicit code flow
  if (code) {
    try {
      console.log('Processing auth code flow with code:', code.substring(0, 5) + '...');
      
      const supabase = createServerClient()
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth code exchange error:', error.message)
        return createAuthRedirectResponse(`/signin?error=${encodeURIComponent(error.message)}`)
      }
      
      console.log('Auth code exchange successful, session established');
      
      // Check if user profile exists with role already
      try {
        // Get the user ID from the session data
        const userId = data.session?.user.id
        
        if (!userId) {
          console.error('No user ID found in session data')
          return createAuthRedirectResponse(`/signin?error=${encodeURIComponent('No user found in session')}`)
        }
        
        console.log('User ID from session:', userId)
        
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', userId)
          .single()
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError.message)
        }
        
        if (profileData?.role) {
          console.log(`User has role: ${profileData.role}, redirecting to home page`);
          // If role exists, redirect to home page instead of dashboard
          const homePage = '/';
          
          // Add a small delay for cookie setting
          await new Promise(resolve => setTimeout(resolve, 500))
          
          return createAuthRedirectResponse(homePage)
        } else {
          console.log('User has no role, redirecting to role selection');
          // No role, redirect to role selection
          
          // Add a small delay for cookie setting
          await new Promise(resolve => setTimeout(resolve, 500))
          
          return createAuthRedirectResponse('/role-selector')
        }
      } catch (profileError) {
        console.error('Error checking user profile:', profileError);
        // If there was an error, redirect to role selector
        return createAuthRedirectResponse('/role-selector')
      }
    } catch (error: any) {
      console.error('Auth callback exception:', error.message || error)
      return createAuthRedirectResponse(`/signin?error=${encodeURIComponent(error.message || 'Authentication failed')}`)
    }
  }

  // If we got here, we don't have a code or token - redirect to token handler as fallback
  console.log('No code or token found, redirecting to token handler as fallback')
  return NextResponse.redirect(
    new URL('/auth/token-handler', requestUrl.origin)
  )
} 