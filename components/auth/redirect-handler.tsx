'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RedirectHandler() {
  const router = useRouter()
  
  // Handle redirect from localhost to production
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if we're on localhost and have auth tokens
    if (
      window.location.hostname === 'localhost' &&
      (window.location.hash.includes('access_token=') || window.location.search.includes('access_token='))
    ) {
      console.log('Detected auth redirect to localhost, redirecting to production')
      
      // Get the production URL from environment or hardcode it
      const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://findr-ai.vercel.app'
      
      // Get the full hash/search params to preserve tokens
      const params = window.location.hash || window.location.search
      
      // Redirect to the same path on production with the tokens
      const redirectUrl = `${productionUrl}${window.location.pathname}${params}`
      
      // Redirect to production
      window.location.href = redirectUrl
    }
  }, [])

  // This component doesn't render anything visibly
  return null
} 