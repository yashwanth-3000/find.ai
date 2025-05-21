import { createServerClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to ensure we have the correct site URL
function getSiteUrl(request: NextRequest): string {
  // First try to get from environment variables
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;
  
  // Fall back to the request host
  const host = request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  
  // If we detect localhost in production, use the production URL
  if (process.env.NODE_ENV === 'production' && 
      (host.includes('localhost') || host.includes('127.0.0.1'))) {
    return 'https://findr-ai.vercel.app';
  }
  
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