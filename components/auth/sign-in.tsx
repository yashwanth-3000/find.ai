'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { runAllChecks } from '@/lib/supabase-debug'
import { FcGoogle } from 'react-icons/fc'
import { LuLoader, LuRefreshCw } from 'react-icons/lu'
import { createBrowserClient } from '@/lib/supabase-browser'
import { debugAuthState } from '@/lib/auth-utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function SignIn() {
  const { signInWithGoogle, loading, error: authError, user, userProfile, resetAuthState } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [debugVisible, setDebugVisible] = useState(false)
  const [isManualProfileCreation, setIsManualProfileCreation] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const error = localError || urlError || authError
  
  // Check if the error is about database saving user
  const isDatabaseSavingError = error?.includes('Database error saving new user') || 
                               error?.includes('server_error') || 
                               error?.includes('unexpected_failure')
  
  // Check if user is already authenticated and redirect if needed
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting...');
      
      // Debug the current state
      debugAuthState();
      
      // If user doesn't have a role, redirect to role selection
      if (!userProfile?.role) {
        console.log('User has no role, redirecting to role selector');
        router.push('/role-selector');
      } else {
        // Redirect to the home page instead of dashboard
        console.log(`User has role ${userProfile.role}, redirecting to home`);
        router.push('/');
      }
    }
  }, [user, userProfile, router]);

  // Handle URL hash fragments (for token auth) on initial load
  useEffect(() => {
    const handleHashFragment = async () => {
      // Only run in browser and when there's a hash
      if (typeof window === 'undefined' || !window.location.hash) {
        return
      }
      
      // Check for error in hash
      if (window.location.hash.includes('#error=')) {
        console.error('Error in URL hash:', window.location.hash)
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const errorMessage = params.get('error_description') || params.get('error') || 'Authentication error'
        setLocalError(decodeURIComponent(errorMessage.replace(/\+/g, ' ')))
        
        // Clear hash from URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
        return
      }
      
      // Check for tokens
      if (!window.location.hash.includes('access_token=')) {
        return
      }
      
      console.log('Detected token in URL hash, handling authentication...')
      setIsLoading(true)
      
      try {
        // Extract tokens from hash
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        
        if (!accessToken) {
          console.error('No access token found in URL hash')
          setLocalError('No access token found')
          setIsLoading(false)
          return
        }
        
        // Create client and set session
        const supabase = createBrowserClient()
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })
        
        if (error) {
          console.error('Error setting session from hash:', error)
          setLocalError(error.message)
          setIsLoading(false)
          throw error
        }
        
        // Clear hash from URL without reloading
        window.history.replaceState(
          {}, 
          document.title, 
          window.location.pathname + window.location.search
        )
        
        // Wait for auth to update then let the main redirect effect handle redirection
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error handling token from hash:', err)
        setLocalError((err as Error).message || 'Error processing authentication')
        setIsLoading(false)
      }
    }
    
    handleHashFragment()
  }, [router])

  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true)
      setLocalError(null)

      // Test Supabase connection before attempting to sign in
      const checkResult = await runAllChecks()
      if (!checkResult.connection.connected) {
        console.error('Supabase connection failed:', checkResult)
        setLocalError('Could not connect to authentication service')
        setIsLoading(false)
        return
      }

      // Clear any previous auth flow state
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_flow_start', new Date().toISOString())
        
        // Clear any previous auth fragments in URL
        if (window.location.hash || window.location.search.includes('error=')) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }

      console.log('Starting Google sign-in process')
      
      // Get the current origin for the callback URL
      const origin = window.location.origin
      const callbackUrl = `${origin}/auth/callback`
      
      console.log('Using callback URL:', callbackUrl)
      
      // Create a Supabase client for the sign-in
      const supabase = createBrowserClient()
      
      // Initiate the sign-in process with Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          // No additional query params needed for implicit flow
        }
      })

      if (error) {
        console.error('Google sign-in error:', error.message)
        setLocalError(error.message)
        setIsLoading(false)
        return
      }
      
      // If we get here, the redirect is about to happen
      console.log('Redirecting to Google for authentication...')
      
      // The page will be redirected by Supabase OAuth
    } catch (err) {
      console.error('Sign in error:', err)
      setLocalError((err as Error).message || 'Sign in failed')
      setIsLoading(false)
    }
  }

  const handleResetAuth = () => {
    console.log('Resetting authentication state')
    setLocalError(null)
    setIsLoading(true)
    
    // Clear any URL parameters
    if (window.location.search || window.location.hash) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    // Reset the auth state
    resetAuthState()
    
    // Wait for reset to complete
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }
  
  const handleManualProfileCreation = async () => {
    setIsManualProfileCreation(true)
    try {
      // Get the current auth session
      const supabase = createBrowserClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('No session found for profile creation:', sessionError)
        setLocalError('You must be logged in to create a profile')
        setIsManualProfileCreation(false)
        return
      }
      
      // Call our API endpoint to create the profile
      const response = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: session.user.id
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create profile')
      }
      
      console.log('Profile created successfully:', data)
      
      // Reset auth state to load the new profile
      handleResetAuth()
      
    } catch (err) {
      console.error('Error creating profile manually:', err)
      setLocalError((err as Error).message || 'Failed to create profile')
      setIsManualProfileCreation(false)
    }
  }

  const toggleDebugInfo = async () => {
    if (!debugVisible) {
      const results = await runAllChecks()
      setDebugInfo(results)
    } else {
      setDebugInfo(null)
    }
    setDebugVisible(!debugVisible)
  }

  // Show a different message if already authenticated but loading role info
  if (user && !userProfile && !error) {
    return (
      <div className="flex justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Authenticated</CardTitle>
            <CardDescription>
              Loading your profile information...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 gap-4">
            <LuLoader className="h-8 w-8 animate-spin text-primary" />
            <Button variant="outline" size="sm" onClick={handleResetAuth}>
              <LuRefreshCw className="mr-2 h-4 w-4" />
              Reset Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
    <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
            Sign in to access your account and start using findr.ai
        </CardDescription>
      </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 mb-4">
              <div>
                <div className="font-medium">Authentication Error</div>
                <div className="text-sm mb-2">{error}</div>
                {isDatabaseSavingError && (
                  <div className="text-sm mb-3">
                    This appears to be a database issue. Please try one of the following:
                  </div>
                )}
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="link" 
                    className="px-0 h-auto py-1 text-red-600 justify-start" 
                    onClick={handleResetAuth}
                  >
                    Reset Authentication
                  </Button>
                  
                  {isDatabaseSavingError && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600"
                      onClick={handleManualProfileCreation}
                      disabled={isManualProfileCreation}
                    >
                      {isManualProfileCreation ? (
                        <>
                          <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                          Creating Profile...
                        </>
                      ) : (
                        "Fix Profile Issue"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

        <Button 
          variant="outline"
            className="w-full h-12 flex items-center gap-2"
            onClick={handleSignInWithGoogle}
            disabled={isLoading || loading}
        >
          {isLoading ? (
              <LuLoader className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <FcGoogle className="h-5 w-5" />
          )}
            Sign in with Google
        </Button>

          {debugVisible && debugInfo && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md text-xs overflow-auto max-h-48 dark:bg-gray-800 dark:border-gray-700">
              <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
      </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <div className="text-sm text-gray-500">
            By signing in, you agree to our Terms and Privacy Policy
          </div>
          <Button
            variant="link"
            size="sm"
            className="text-xs text-gray-400"
            onClick={toggleDebugInfo}
          >
            {debugVisible ? 'Hide Debug Info' : 'Debug Connection'}
          </Button>
      </CardFooter>
    </Card>
    </div>
  )
} 