'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { 
  LuLoader, 
  LuLinkedin, 
  LuRefreshCw, 
  LuChevronLeft, 
  LuTriangle,
  LuCheck,
  LuUser,
  LuExternalLink
} from 'react-icons/lu'

export default function ProfileImportProgress() {
  const router = useRouter()
  const { user, supabase } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [snapshotId, setSnapshotId] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle')
  const [logs, setLogs] = useState<{timestamp: string, message: string, type: 'info' | 'error' | 'success'}[]>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0) // 0-100
  
  // API key for Bright Data
  const apiKey = '7188c6d4-44e1-40d0-9309-d211fbaa4160'
  
  // Log function
  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const now = new Date()
    const timestamp = now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0')
    setLogs(prev => [...prev, { timestamp, message, type }])
    console.log(`[LinkedIn Import] ${message}`)
  }
  
  // Clear logs
  const clearLogs = () => {
    setLogs([])
  }
  
  // Load profile and check import status
  useEffect(() => {
    // Clear return path if there's no user
    if (!user) {
      router.push('/signin')
      return
    }
    
    // Create an async function to load the profile
    async function loadProfile() {
      try {
        setLoading(true)
        
        // Get applicant profile data
        const { data, error } = await supabase
          .from('applicant_profiles')
          .select('*, linkedin_url, linkedin_import_status, linkedin_snapshot_id, linkedin_profile_raw')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error loading profile:', error)
          setError('Failed to load profile data')
          return
        }
        
        setProfile(data)
        setLinkedinUrl(data.linkedin_url || '')
        setImportStatus(data.linkedin_import_status || 'idle')
        
        if (data.linkedin_snapshot_id) {
          setSnapshotId(data.linkedin_snapshot_id)
          addLog(`Found ongoing import with snapshot ID: ${data.linkedin_snapshot_id}`, 'info')
          
          // Resume the import process if it's pending
          if (data.linkedin_import_status === 'pending') {
            resumeImport(data.linkedin_snapshot_id)
          }
        } else if (data.linkedin_url && !data.linkedin_profile_raw) {
          // If we have a URL but no data and no active import, we need to start the import
          startImport(data.linkedin_url)
        } else if (data.linkedin_profile_raw) {
          // If import already completed, redirect to profile
          addLog('LinkedIn data already imported', 'success')
          setTimeout(() => {
            router.push('/applicant/profile')
          }, 1500)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
    
    // No need to add startImport or resumeImport to the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, supabase, router])
  
  // Start a new import process
  const startImport = async (url: string) => {
    if (!url) {
      setError('LinkedIn URL is required')
      return
    }
    
    clearLogs()
    setImportStatus('pending')
    setProgress(5)
    
    addLog('Starting LinkedIn data import process...', 'info')
    addLog(`Target URL: ${url}`, 'info')
    
    try {
      // Save the pending status to database
      if (user) {
        await supabase
          .from('applicant_profiles')
          .update({
            linkedin_import_status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
      
      // Step 1: Trigger the Bright Data API
      addLog('Triggering Brightdata API request...', 'info')
      setProgress(10)
      
      const triggerResponse = await fetch('/api/linkedin/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          apiKey: apiKey
        })
      })
      
      const triggerData = await triggerResponse.json()
      
      if (!triggerResponse.ok) {
        throw new Error(triggerData.error || `API failed with status: ${triggerResponse.status}`)
      }
      
      addLog('API request successful', 'success')
      
      if (!triggerData.snapshot_id) {
        throw new Error('No snapshot ID returned from API')
      }
      
      const newSnapshotId = triggerData.snapshot_id
      setSnapshotId(newSnapshotId)
      setProgress(15)
      addLog(`Snapshot ID received: ${newSnapshotId}`, 'success')
      
      // Update snapshot ID in database
      if (user) {
        await supabase
          .from('applicant_profiles')
          .update({
            linkedin_snapshot_id: newSnapshotId,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
      
      // Step 2: Start polling for results
      pollForResults(newSnapshotId)
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      setError(errorMsg)
      addLog(`Error: ${errorMsg}`, 'error')
      setImportStatus('failed')
      
      // Update status in database
      if (user) {
        await supabase
          .from('applicant_profiles')
          .update({
            linkedin_import_status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    }
  }
  
  // Resume an existing import
  const resumeImport = async (existingSnapshotId: string) => {
    addLog('Resuming import process...', 'info')
    addLog(`Using existing snapshot ID: ${existingSnapshotId}`, 'info')
    setImportStatus('pending')
    setProgress(20)
    
    // Start polling for results with existing snapshot ID
    pollForResults(existingSnapshotId)
  }
  
  // Poll for results with a given snapshot ID
  const pollForResults = async (snapshotId: string) => {
    setProgress(25)
    let profileData = null
    let attempts = 0
    const maxAttempts = 25
    
    while (!profileData && attempts < maxAttempts) {
      attempts++
      // Calculate progress: 25% at start, 90% at max attempts
      const progressValue = 25 + Math.floor((attempts / maxAttempts) * 65)
      setProgress(progressValue)
      
      addLog(`Fetching data attempt ${attempts}/${maxAttempts}...`, 'info')
      
      try {
        // Wait between attempts
        await new Promise(resolve => setTimeout(resolve, 6000))
        
        const snapshotResponse = await fetch(`/api/linkedin/snapshot?id=${snapshotId}&apiKey=${encodeURIComponent(apiKey)}`)
        const snapshotData = await snapshotResponse.json()
        
        if (!snapshotResponse.ok) {
          addLog(`Error fetching snapshot: ${snapshotData.error || snapshotResponse.statusText}`, 'error')
          continue
        }
        
        // Check if still processing
        if (snapshotData && snapshotData.status === 'running') {
          addLog('Snapshot is still processing, waiting...', 'info')
          continue
        }
        
        // Check if we have valid data
        if (Array.isArray(snapshotData) && snapshotData.length > 0) {
          // Check if we have a valid profile
          if (snapshotData[0].name || snapshotData[0].id || snapshotData[0].linkedin_id) {
            profileData = snapshotData[0]
            addLog('Successfully retrieved LinkedIn profile data!', 'success')
            break
          }
        }
        
        addLog('Data format was unexpected. Trying again...', 'info')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        addLog(`Error in attempt ${attempts}: ${errorMsg}`, 'error')
      }
    }
    
    if (!profileData) {
      addLog('Failed to retrieve profile data after multiple attempts', 'error')
      setError('Failed to retrieve LinkedIn data after multiple attempts')
      setImportStatus('failed')
      
      // Update failure status in database
      if (user) {
        await supabase
          .from('applicant_profiles')
          .update({
            linkedin_import_status: 'failed',
            linkedin_snapshot_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
      
      return
    }
    
    // Success! Save the data
    setProgress(95)
    addLog('Saving LinkedIn data to database...', 'info')
    
    try {
      if (user) {
        await supabase
          .from('applicant_profiles')
          .update({
            linkedin_profile_raw: profileData,
            linkedin_import_status: 'completed',
            linkedin_snapshot_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        setImportStatus('completed')
        setProgress(100)
        addLog('LinkedIn profile data saved successfully!', 'success')
        
        // Redirect to profile page after successful import
        setTimeout(() => {
          router.push('/applicant/profile')
        }, 2000)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      addLog(`Error saving profile data: ${errorMsg}`, 'error')
      setError('Failed to save profile data')
      setImportStatus('failed')
    }
  }
  
  // Retry failed import
  const retryImport = () => {
    if (!profile?.linkedin_url) {
      setError('LinkedIn URL is missing')
      return
    }
    
    startImport(profile.linkedin_url)
  }
  
  // Cancel and go back to profile
  const cancelAndReturn = () => {
    router.push('/applicant/profile')
  }
  
  return (
    <>
      <Navbar />
      <Container>
        <div className="pt-20 pb-12">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <LuLinkedin className="h-5 w-5 text-blue-600" />
                  LinkedIn Profile Import
                </CardTitle>
                <div>
                  {importStatus === 'pending' && (
                    <span className="text-sm font-normal bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      In Progress
                    </span>
                  )}
                  {importStatus === 'completed' && (
                    <span className="text-sm font-normal bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  )}
                  {importStatus === 'failed' && (
                    <span className="text-sm font-normal bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Failed
                    </span>
                  )}
                </div>
              </div>
              {linkedinUrl && (
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <span>URL:</span>
                  <a 
                    href={linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {linkedinUrl.replace(/^https?:\/\/(www\.)?/i, '')}
                    <LuExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <LuLoader className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading import status...</p>
                </div>
              ) : (
                <>
                  {/* Progress bar */}
                  {importStatus === 'pending' && (
                    <div className="mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Import Progress</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Status messages */}
                  {importStatus === 'completed' && (
                    <div className="mb-6 bg-green-50 p-4 rounded-md border border-green-200 flex items-start gap-3">
                      <LuCheck className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-green-800">Import Completed Successfully</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Your LinkedIn profile data has been successfully imported.
                          You will be redirected to your profile page shortly.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {importStatus === 'failed' && (
                    <div className="mb-6 bg-red-50 p-4 rounded-md border border-red-200 flex items-start gap-3">
                      <LuTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-red-800">Import Failed</h3>
                        <p className="text-sm text-red-700 mt-1">
                          {error || 'There was an error importing your LinkedIn profile data.'}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          You can try again, or go back to your profile and try later.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Console logs */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-slate-100 px-3 py-2 border-b flex justify-between items-center">
                      <span className="text-sm font-medium">Import Logs</span>
                      {snapshotId && (
                        <span className="text-xs text-muted-foreground font-mono">
                          Snapshot: {snapshotId}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs p-4 bg-black text-green-400 h-[300px] overflow-auto">
                      {logs.length === 0 ? (
                        <div className="text-gray-500 italic">No logs yet. Import process will start momentarily.</div>
                      ) : (
                        logs.map((log, index) => (
                          <div key={index} className={`mb-1 ${
                            log.type === 'error' ? 'text-red-400' :
                            log.type === 'success' ? 'text-green-400' :
                            'text-blue-400'
                          }`}>
                            <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={cancelAndReturn}
                className="gap-1"
              >
                <LuChevronLeft className="h-4 w-4" />
                {importStatus === 'completed' ? 'Go to Profile' : 'Back to Profile'}
              </Button>
              
              <div className="flex gap-2">
                {importStatus === 'failed' && (
                  <Button
                    variant="default"
                    onClick={retryImport}
                    className="gap-1"
                  >
                    <LuRefreshCw className="h-4 w-4" />
                    Retry Import
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </Container>
    </>
  )
} 