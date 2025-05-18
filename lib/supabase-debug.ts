import { testBrowserConnection } from './supabase-browser'

// Check environment variables
export const checkSupabaseEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const results = {
    url: {
      exists: Boolean(url),
      value: url ? `${url.substring(0, 15)}...` : 'Missing',
    },
    key: {
      exists: Boolean(key),
      value: key ? `${key.substring(0, 10)}...` : 'Missing',
    }
  }
  
  return results
}

// Test Supabase connection status
export const testSupabaseConnection = async () => {
  try {
    const startTime = Date.now()
    const isConnected = await testBrowserConnection()
    const endTime = Date.now()
    
    return {
      connected: isConnected,
      responseTime: endTime - startTime,
    }
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: -1,
    }
  }
}

// Run all debug checks
export const runAllChecks = async () => {
  const envStatus = checkSupabaseEnv()
  const connectionStatus = await testSupabaseConnection()
  
  return {
    environment: envStatus,
    connection: connectionStatus,
    timestamp: new Date().toISOString(),
  }
} 