'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RedirectHandler() {
  const router = useRouter()
  
  // Handle redirect from localhost to production
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Defines our production URL
    const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findr-ai.vercel.app'
    
    // More aggressive check for auth tokens in URL
    const hasAuthToken = () => {
      const fullUrl = window.location.href
      return (
        fullUrl.includes('access_token=') ||
        fullUrl.includes('refresh_token=') ||
        fullUrl.includes('id_token=') ||
        fullUrl.includes('code=') ||
        (window.location.hash && window.location.hash.length > 20)
      )
    }

    // Check if we're on localhost and have auth tokens
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
    if (isLocalhost && hasAuthToken()) {
      console.log('⚠️ CRITICAL: Detected auth redirect to localhost, redirecting to production')
      
      // Get the full hash/search params to preserve tokens
      const path = window.location.pathname
      const query = window.location.search
      const hash = window.location.hash
      
      // Create the redirect URL - prioritize token-handler if we have hash tokens
      let redirectPath = path
      if (hash.includes('access_token=')) {
        redirectPath = '/auth/token-handler'
      }
      
      // Build the full redirect URL
      const redirectUrl = `${productionUrl}${redirectPath}${query}${hash}`
      
      console.log('Redirecting to:', redirectUrl)
      window.location.href = redirectUrl
    }
  }, [])

  // This component doesn't render anything visibly
  return null
} 