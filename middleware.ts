import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Define routes that should redirect to home if already authenticated
const AUTH_ROUTES = [
  '/signin',
  '/login'
]

export async function middleware(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const pathName = requestUrl.pathname
    
    // First check if we have a localhost auth token situation which needs immediate redirect
    const isLocalhost = requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1'
    
    // Check for auth tokens in URL
    const hasAuthToken = 
      requestUrl.hash.includes('access_token=') || 
      requestUrl.search.includes('access_token=') ||
      requestUrl.hash.includes('refresh_token=') ||
      requestUrl.hash.includes('id_token=') ||
      requestUrl.search.includes('code=') ||
      (requestUrl.hash && requestUrl.hash.length > 20) // Likely a token

    if (isLocalhost && hasAuthToken) {
      console.log('Middleware: Detected auth tokens on localhost, redirecting to auth-redirect.html')
      
      // Redirect to our special handler page that will redirect to production
      const redirectUrl = new URL('/auth-redirect.html', requestUrl.origin)
      
      // Copy search params
      requestUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value)
      })
      
      // Preserve hash fragments (contains tokens)
      redirectUrl.hash = requestUrl.hash
      
      return NextResponse.redirect(redirectUrl)
    }
    
    // Create supabase server client for normal auth checks
    const supabase = createServerClient()
    
    // Get session from Supabase
    const { data: { session } } = await supabase.auth.getSession()
    
    // Important: Check for auth redirect flag in the URL
    // When present, we should not redirect, allowing cookies to properly set
    const isAuthRedirect = requestUrl.searchParams.get('auth_redirect') === 'true'
    
    // If we're in the middle of auth flow, don't interrupt
    if (isAuthRedirect) {
      return NextResponse.next()
    }
    
    // If user is authenticated and trying to access auth routes (signin/login), 
    // redirect to home page
    const isAuthRoute = AUTH_ROUTES.some(route => pathName === route || pathName === `${route}/`)
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    }
    
    // Allow the request to continue for all routes
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, allow the request to continue
    return NextResponse.next()
  }
}

// Match both auth routes and all paths for checking localhost auth tokens
export const config = {
  matcher: [
    // Auth routes
    '/signin',
    '/login',
    '/auth/:path*',
    '/auth-redirect/:path*',
    
    // Main pages that may need auth checks
    '/',
    '/role-selector',
    '/dashboard',
    '/profile',
    '/applicant/:path*',
    '/company/:path*',
    
    // Exclude all static files and API routes by not including them
  ],
} 