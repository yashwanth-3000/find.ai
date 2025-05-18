'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase-browser'
import { LuLoader } from 'react-icons/lu'

export default function TokenHandler() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleTokenFromFragment = async () => {
      try {
        // We need to handle the token from the URL fragment
        if (typeof window !== 'undefined') {
          console.log('Processing token from URL fragment')
          const hash = window.location.hash
          
          if (!hash) {
            setError('No token found in URL')
            setIsProcessing(false)
            return
          }
          
          // Log the hash format (for debugging, hide sensitive data)
          console.log(`Hash format: ${hash.split('=')[0]}=...`)
          
          // Create a Supabase client
          const supabase = createBrowserClient()
          
          // The session should be automatically set by Supabase's detectSessionInUrl
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !session) {
            console.error('Error getting session:', sessionError)
            setError(sessionError?.message || 'Failed to get session')
            setIsProcessing(false)
            return
          }
          
          console.log('Session established successfully')
          
          // Check if user profile exists with role already
          try {
            const userId = session.user.id
            
            if (userId) {
              const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', userId)
                .single()
              
              if (profileData?.role) {
                console.log(`User has role: ${profileData.role}, redirecting to home page`)
                // If role exists, redirect to home page instead of dashboard
                router.push('/')
                return
              } else {
                console.log('User has no role, redirecting to role selection')
                // No role, redirect to role selection
                router.push('/role-selector')
                return
              }
            }
          } catch (profileError) {
            console.error('Error checking user profile:', profileError)
            // If there was an error, redirect to role selector by default
            router.push('/role-selector')
            return
          }
          
          // If we couldn't determine role, default to role selector
          router.push('/role-selector')
        }
      } catch (err: any) {
        console.error('Error handling token:', err)
        setError(err.message || 'Failed to process authentication')
        setIsProcessing(false)
      }
    }
    
    handleTokenFromFragment()
  }, [router])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white shadow-md rounded-lg">
        <div className="text-center">
          {isProcessing ? (
            <>
              <LuLoader className="mx-auto h-12 w-12 text-primary animate-spin" />
              <h2 className="mt-4 text-xl font-semibold">Completing sign in...</h2>
              <p className="mt-2 text-gray-500">Please wait while we process your authentication.</p>
            </>
          ) : error ? (
            <>
              <div className="mx-auto h-12 w-12 text-red-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-10 w-10">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-red-600">Authentication Error</h2>
              <p className="mt-2 text-gray-500">{error}</p>
              <button 
                onClick={() => router.push('/signin')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                Return to Sign In
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
} 