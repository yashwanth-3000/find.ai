'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { LuLoader, LuRefreshCw } from 'react-icons/lu'

export default function TokenHandler() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      // Clear any URL fragments
      window.history.replaceState({}, document.title, window.location.pathname)
      // Force refresh session
      setIsProcessing(true)
      setError(null)
      // Process again with a delay
      setTimeout(() => {
        handleTokenFromFragment()
      }, 1000)
    }
  }

  const handleTokenFromFragment = async () => {
    try {
      // We need to handle the token from the URL fragment
      if (typeof window === 'undefined') {
        return
      }
      
      console.log('Processing token from URL fragment or search params')
      const hash = window.location.hash
      const search = window.location.search
      
      // First check if we have tokens in the URL hash or search params
      if (!hash && !search.includes('access_token')) {
        const errorMsg = 'No token found in URL'
        console.error(errorMsg)
        setError(errorMsg)
        setIsProcessing(false)
        return
      }
      
      // Create debug info
      if (hash) {
        console.log(`Hash format: ${hash.split('=')[0]}=...`)
        setDebugInfo(`URL contains hash starting with: ${hash.split('=')[0]}=...`)
      } else if (search) {
        console.log(`Search format: ${search.split('=')[0]}=...`)
        setDebugInfo(`URL contains search params starting with: ${search.split('=')[0]}=...`)
      }
      
      // Create a Supabase client
      const supabase = createBrowserClient()
      
      try {
        // First try to let Supabase handle the URL automatically
        const { data, error: detectError } = await supabase.auth.getUser()
        
        if (detectError) {
          console.warn('Error with automatic session detection:', detectError)
          setDebugInfo((prev) => `${prev}\nAutomatic detection failed: ${detectError.message}`)
        }
        
        if (data?.user) {
          console.log('User detected automatically:', data.user.id)
          setDebugInfo((prev) => `${prev}\nUser found: ${data.user.id}`)
          
          // Get full session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            // Check if user profile exists
            const { data: profileData } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', data.user.id)
              .single()
            
            // Redirect based on role
            if (profileData?.role) {
              console.log(`User has role ${profileData.role}, redirecting to home`)
              router.push('/')
            } else {
              console.log('No role found, redirecting to role selector')
              router.push('/role-selector')
            }
            return
          }
        }
        
        // If automatic detection failed, try manual extraction
        console.log('Trying manual token extraction from URL')
        setDebugInfo((prev) => `${prev}\nTrying manual token extraction`)
        
        let accessToken: string | null = null
        let refreshToken: string | null = null
        
        // Extract from hash if present
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1))
          accessToken = hashParams.get('access_token')
          refreshToken = hashParams.get('refresh_token')
        }
        
        // Or extract from search params if present
        if (!accessToken && search) {
          const searchParams = new URLSearchParams(search)
          accessToken = searchParams.get('access_token')
          refreshToken = searchParams.get('refresh_token')
        }
        
        if (!accessToken) {
          throw new Error('No access token found in URL fragment or search params')
        }
        
        // Set session manually
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })
        
        if (sessionError) {
          throw sessionError
        }
        
        // Clear hash/params from URL
        window.history.replaceState({}, document.title, window.location.pathname)
        
        // Get user session and redirect
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          const userId = session.user.id
          
          // Check for user profile
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', userId)
            .single()
          
          if (profileData?.role) {
            router.push('/')
          } else {
            router.push('/role-selector')
          }
        } else {
          throw new Error('Failed to establish session')
        }
      } catch (err: any) {
        console.error('Error processing authentication:', err)
        setError(err.message || 'Failed to process authentication')
        setIsProcessing(false)
      }
    } catch (err: any) {
      console.error('Error handling token:', err)
      setError(err.message || 'Failed to process authentication')
      setIsProcessing(false)
    }
  }
  
  useEffect(() => {
    // Force a redirect if we're on localhost in production
    const forcedRedirectCheck = () => {
      if (typeof window === 'undefined') return false;
      
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isProd = process.env.NODE_ENV === 'production';
      const hasToken = window.location.hash.includes('access_token=') || window.location.search.includes('access_token=');
      
      if (isProd && isLocalhost && hasToken) {
        console.log('CRITICAL: Detected localhost URL in production with auth tokens. Forcing redirect to production URL.');
        const prodUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findr-ai.vercel.app';
        const path = window.location.pathname;
        const params = window.location.hash || window.location.search;
        const fullRedirectUrl = `${prodUrl}${path}${params}`;
        
        console.log('Redirecting to:', fullRedirectUrl);
        window.location.href = fullRedirectUrl;
        return true;
      }
      
      return false;
    };
    
    // Only proceed if we haven't forced a redirect
    if (!forcedRedirectCheck()) {
      handleTokenFromFragment();
    }
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white shadow-md rounded-lg dark:bg-gray-800">
        <div className="text-center">
          {isProcessing ? (
            <>
              <LuLoader className="mx-auto h-12 w-12 text-primary animate-spin" />
              <h2 className="mt-4 text-xl font-semibold">Completing sign in...</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Please wait while we process your authentication.</p>
              <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">If loading takes more than 3 seconds, please refresh the page.</p>
            </>
          ) : error ? (
            <>
              <div className="mx-auto h-12 w-12 text-red-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-10 w-10">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-red-600">Authentication Error</h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                <button 
                  onClick={() => router.push('/signin')}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                  Return to Sign In
                </button>
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <LuRefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </button>
              </div>
              
              {debugInfo && (
                <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-900 text-left rounded text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  <p className="font-medium mb-1">Debug info:</p>
                  {debugInfo}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
} 