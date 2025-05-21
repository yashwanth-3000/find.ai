'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Production domain - should match the one in auth-redirect.html
const PRODUCTION_DOMAIN = 'https://findr-ai.vercel.app'

export default function AuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [info, setInfo] = useState('')
  const [redirectAttempted, setRedirectAttempted] = useState(false)

  useEffect(() => {
    // Check if we've already attempted a redirect to avoid loops
    const hasAttempted = sessionStorage.getItem('auth_redirect_attempted')
    if (hasAttempted) {
      setInfo('Already attempted a redirect. Please use the button below.')
      setRedirectAttempted(true)
      return
    }

    // Mark that we've attempted a redirect
    sessionStorage.setItem('auth_redirect_attempted', 'true')

    try {
      // Get URL components
      const hash = window.location.hash || ''
      const search = window.location.search || ''
      let targetPath = '/auth/token-handler' // Default

      // Determine the right target path based on tokens
      if (hash.includes('access_token=')) {
        targetPath = '/auth/token-handler'
      } else if (search.includes('code=')) {
        targetPath = '/auth/callback'
      }

      // Log the redirect
      console.log('Redirecting to production:', PRODUCTION_DOMAIN + targetPath + search + hash)
      
      // Perform the redirect
      window.location.replace(PRODUCTION_DOMAIN + targetPath + search + hash)
    } catch (error) {
      console.error('Error redirecting:', error)
      setInfo('Error redirecting: ' + (error instanceof Error ? error.message : String(error)))
      setRedirectAttempted(true)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Redirecting to Findr.ai</h1>
          
          <div className="mt-4 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            You're being redirected to our secure production environment...
          </p>
          
          {info && (
            <p className="mt-4 text-amber-600 dark:text-amber-400">
              {info}
            </p>
          )}
          
          {redirectAttempted && (
            <button
              onClick={() => window.location.href = PRODUCTION_DOMAIN}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Go to Findr.ai
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 