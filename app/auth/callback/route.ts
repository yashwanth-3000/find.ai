import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  // Default redirect to role-selector to ensure new users choose a role
  const next = requestUrl.searchParams.get('next') || '/role-selector'
  
  console.log('Auth callback received with:', {
    code: code ? 'exists' : 'missing',
    error: error || 'none',
    url: req.url,
    hasHash: req.url.includes('#'),
    searchParams: Object.fromEntries(requestUrl.searchParams.entries())
  })

  // Check for URL fragment with access_token (implicit flow)
  // This happens when the OAuth provider returns token directly in URL fragment
  if (req.url.includes('#') || req.url.includes('access_token=') || req.url.includes('error=')) {
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
      maxAge: 10, // Short-lived cookie (10 seconds)
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
        
        if (userId) {
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', userId)
            .single()
          
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
        }
      } catch (profileError) {
        console.error('Error checking user profile:', profileError);
        // If there was an error, just continue with default redirection
      }
      
      // Add a small delay for cookie setting
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Successful authentication, redirect to the intended page (role-selector by default)
      return createAuthRedirectResponse(next)
    } catch (error: any) {
      console.error('Auth callback exception:', error.message || error)
      return createAuthRedirectResponse(`/signin?error=${encodeURIComponent(error.message || 'Authentication failed')}`)
    }
  }

  // Handle errors passed in query params
  if (error) {
    console.error('Auth error from provider:', error)
    return createAuthRedirectResponse(`/signin?error=${encodeURIComponent(error)}`)
  }

  // If no code is present, redirect to token handler as a fallback
  // This might be needed if tokens are passed in other ways
  console.log('No code found, redirecting to token handler as fallback')
  return NextResponse.redirect(
    new URL('/auth/token-handler', requestUrl.origin)
  )
} 