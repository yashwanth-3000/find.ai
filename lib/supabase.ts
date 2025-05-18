import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

// Only used server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// This method should not be used client-side
export const createServerClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

export const testConnection = async () => {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.rpc('check_db_connection')
    
    if (error) {
      console.error('Connection test failed:', error)
      return false
    }
    
    return data || false
  } catch (err) {
    console.error('Connection test error:', err)
    return false
  }
} 