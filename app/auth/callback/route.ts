import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to ensure we have the correct site URL
function getSiteUrl(request: NextRequest): string {
  // Production URL - hardcoded value
  const productionUrl = 'https://findr-ai.vercel.app';
  
  // First try to get from environment variables
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;
  
  // Check if we're in production environment
  if (process.env.NODE_ENV === 'production') {
    return productionUrl;
  }
  
  // Check if we're on localhost
  const host = request.headers.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    // If we're on localhost with tokens, we should use production URL
    const url = new URL(request.url);
    if (url.hash.includes('access_token=') || 
        url.search.includes('access_token=') ||
        url.search.includes('code=')) {
      return productionUrl;
    }
  }
  
  // Get protocol from headers or default to https
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  
  // Otherwise use the current host
  return `${proto}://${host}`;
}

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
  
  // Get proper site URL for redirects
  const siteUrl = getSiteUrl(req);
  
  // If we get an error in the callback, redirect to login with error
  if (error) {
    console.error('Auth error:', error, errorDescription)
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`)
  }
  
  // This is a code exchange request
  if (code) {
    const supabase = createServerClient();
    
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Code exchange error:', error);
        return NextResponse.redirect(`${siteUrl}/login?error=code_exchange_failed&error_description=${encodeURIComponent(error.message)}`)
      }
      
      // Successful sign-in, redirect to the next page
      console.log('Code exchange successful, redirecting to:', next);
      return NextResponse.redirect(`${siteUrl}${next}`)
      
    } catch (err) {
      console.error('Unexpected error during code exchange:', err);
      return NextResponse.redirect(`${siteUrl}/login?error=unexpected&error_description=An+unexpected+error+occurred+during+sign+in`)
    }
  }
  
  // If we get here, we don't have a code or an error, just redirect to token handler
  return NextResponse.redirect(`${siteUrl}/auth/token-handler`)
} 