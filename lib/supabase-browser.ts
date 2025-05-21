import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

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
      // Use implicit flow as it's more reliable for our current setup
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
    if (!supabase) return false
    
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