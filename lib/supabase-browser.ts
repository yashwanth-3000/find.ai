import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

/**
 * Returns the correct site URL for the current environment
 */
export function getSiteUrl() {
  if (typeof window !== 'undefined') {
    // Check for localhost and if we need to redirect
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    // In production redirects, use the environment variable or default to the findr-ai.vercel.app
    if (isLocalhost && window.location.hash.includes('access_token')) {
      return process.env.NEXT_PUBLIC_SITE_URL || 'https://findr-ai.vercel.app'
    }
  }
  
  // In all other cases, use the current origin or fallback to production URL
  return typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://findr-ai.vercel.app')
}

/**
 * Creates a Supabase client configured for browser use
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials for browser client')
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Use implicit flow instead of PKCE to avoid code verifier issues
      flowType: 'implicit',
      detectSessionInUrl: true,
      storageKey: 'findr-auth-token'
    }
  })
}

// Use this singleton to maintain a single instance across components
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}

// For testing database connectivity
export async function testBrowserConnection() {
  try {
    const supabase = getBrowserClient()
    const { data, error } = await supabase.rpc('check_db_connection')
    
    if (error) {
      console.error('Browser connection test failed:', error)
      return false
    }
    
    return data || false
  } catch (err) {
    console.error('Browser connection test error:', err)
    return false
  }
} 