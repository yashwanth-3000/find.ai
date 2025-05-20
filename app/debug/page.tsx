'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

export default function DebugPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, userProfile, loading, refreshSession } = useAuth()
  
  const [logs, setLogs] = useState<string[]>([])
  const [manualTarget, setManualTarget] = useState('/applicant/profile/edit')
  const [navigationType, setNavigationType] = useState<'push' | 'link'>('push')
  
  useEffect(() => {
    addLog(`Page loaded at: ${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)
    addLog(`User authenticated: ${!!user}`)
    addLog(`User profile loaded: ${!!userProfile}`)
    if (userProfile) {
      addLog(`User role: ${userProfile.role || 'No role set'}`)
    }
    
    // Test for history API issues
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    
    window.history.pushState = function() {
      addLog(`history.pushState called with: ${JSON.stringify(arguments[2])}`)
      return originalPushState.apply(this, arguments as any)
    }
    
    window.history.replaceState = function() {
      addLog(`history.replaceState called with: ${JSON.stringify(arguments[2])}`)
      return originalReplaceState.apply(this, arguments as any)
    }
    
    const handleBeforeUnload = () => {
      addLog('Page navigation/unload event triggered')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pathname, searchParams, user, userProfile])
  
  function addLog(message: string) {
    setLogs(prev => [`${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`, ...prev].slice(0, 50))
  }
  
  function handleRefreshSession() {
    addLog('Manually refreshing session')
    refreshSession()
  }
  
  function handleManualNavigation() {
    addLog(`Attempting to navigate to: ${manualTarget} using ${navigationType}`)
    
    if (navigationType === 'push') {
      router.push(manualTarget)
    }
  }
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto pt-24 pb-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Debug Navigation Issues</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>Current authentication status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Authentication Status:</p>
                <p className={user ? "text-green-600" : "text-red-600"}>
                  {loading ? "Loading..." : user ? "Authenticated" : "Not authenticated"}
                </p>
              </div>
              
              {user && (
                <div>
                  <p className="font-medium">User ID:</p>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>
              )}
              
              {userProfile && (
                <div>
                  <p className="font-medium">Role:</p>
                  <p className="font-semibold">{userProfile.role || "No role"}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleRefreshSession}>Refresh Session</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Navigation Test</CardTitle>
              <CardDescription>Try different navigation methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="font-medium block mb-2">Target URL:</label>
                <input 
                  type="text"
                  value={manualTarget}
                  onChange={(e) => setManualTarget(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="font-medium block mb-2">Navigation Type:</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="navType"
                      checked={navigationType === 'push'}
                      onChange={() => setNavigationType('push')}
                      className="mr-2"
                    />
                    router.push()
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="navType"
                      checked={navigationType === 'link'}
                      onChange={() => setNavigationType('link')}
                      className="mr-2"
                    />
                    &lt;Link&gt; component
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button onClick={handleManualNavigation} disabled={navigationType === 'link'}>
                Navigate (router)
              </Button>
              
              {navigationType === 'link' && (
                <Button asChild>
                  <Link href={manualTarget}>Navigate (Link)</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Navigation Logs</h2>
            <Button variant="outline" onClick={() => setLogs([])}>
              Clear Logs
            </Button>
          </div>
          
          <div className="bg-black text-white p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="border-b border-gray-800 py-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/applicant/profile/edit">Try Applicant Profile Edit</Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/profile">Go to Profile</Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/role-check">Go to Role Check</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Button asChild variant="default" className="bg-green-600 hover:bg-green-700">
            <Link href="/edit-profile">Go to NEW Edit Profile</Link>
          </Button>
          
          <Button asChild variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <Link href="/edit-profile/applicant">Direct to Applicant Edit</Link>
          </Button>
          
          <Button asChild variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            <Link href="/edit-profile/company">Direct to Company Edit</Link>
          </Button>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Profile Direct Access</h3>
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/applicant/edit" 
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
            >
              Direct Applicant Edit
            </Link>
            <Link 
              href="/company/edit" 
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Direct Company Edit
            </Link>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Profile View Direct Access</h3>
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/applicant/profile" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              View Applicant Profile
            </Link>
            <Link 
              href="/company/profile" 
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              View Company Profile
            </Link>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">API Testing Tools</h3>
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/debug/linkedin-api" 
              className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700"
            >
              LinkedIn API Test Console
            </Link>
          </div>
        </div>
      </main>
    </>
  )
} 