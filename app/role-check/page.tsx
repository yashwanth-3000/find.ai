'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'

export default function RoleCheckPage() {
  const { user, userProfile, loading, error, refreshSession } = useAuth()
  const [refreshCount, setRefreshCount] = useState(0)
  
  useEffect(() => {
    // Automatically refresh on first load
    if (refreshCount === 0) {
      refreshSession()
      setRefreshCount(1)
    }
  }, [refreshSession, refreshCount])
  
  const handleManualRefresh = () => {
    refreshSession()
    setRefreshCount(prev => prev + 1)
  }
  
  return (
    <>
      <Navbar />
      <main className="flex-1 container mx-auto pt-24 px-6 pb-12">
        <h1 className="text-3xl font-bold mb-8">Authentication Status Check</h1>
        
        {loading ? (
          <div className="p-4 bg-gray-100 rounded">Loading...</div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Session Information</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Authenticated:</p>
                  <p className={user ? "text-green-600" : "text-red-600"}>
                    {user ? "Yes" : "No"}
                  </p>
                </div>
                
                {user && (
                  <div>
                    <p className="font-medium">User ID:</p>
                    <p className="font-mono text-sm">{user.id}</p>
                  </div>
                )}
                
                <div>
                  <p className="font-medium">Profile Loaded:</p>
                  <p className={userProfile ? "text-green-600" : "text-red-600"}>
                    {userProfile ? "Yes" : "No"}
                  </p>
                </div>
                
                {userProfile && (
                  <>
                    <div>
                      <p className="font-medium">User Role:</p>
                      <p className="font-semibold text-blue-600">
                        {userProfile.role || "No role set"}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-medium">Display Name:</p>
                      <p>{userProfile.display_name || "Not set"}</p>
                    </div>
                  </>
                )}
                
                {error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded">
                    <p className="font-medium">Error:</p>
                    <p>{error}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button onClick={handleManualRefresh}>
                Refresh Session (Count: {refreshCount})
              </Button>
              
              {userProfile?.role === 'applicant' && (
                <Button asChild variant="outline">
                  <Link href="/applicant/profile/edit">Go to Applicant Profile</Link>
                </Button>
              )}
              
              <Button asChild variant="outline">
                <Link href="/profile">Go to Profile Overview</Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/role-select">Go to Role Selection</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </>
  )
} 