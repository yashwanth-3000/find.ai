'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { useAuth } from '@/contexts/auth-context'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { LuLoader, LuSend, LuTerminal, LuDownload, LuInfo, LuRefreshCcw, LuCopy, LuClipboard, LuCheck, LuCode } from 'react-icons/lu'

export default function LinkedInApiTest() {
  const { user } = useAuth()
  
  // States for API test
  const [linkedinUrl, setLinkedinUrl] = useState('https://www.linkedin.com/in/pyashwanthkrishna/')
  const [apiKey, setApiKey] = useState('fd1c528d-23db-4f4b-9dbc-53835c75e2b8')
  const [isTesting, setIsTesting] = useState(false)
  const [logs, setLogs] = useState<{timestamp: string, message: string, type: 'info' | 'error' | 'success'}[]>([])
  const [snapshotId, setSnapshotId] = useState<string | null>(null)
  const [resultData, setResultData] = useState<any>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [saveToDb, setSaveToDb] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  const [autoPollingActive, setAutoPollingActive] = useState(false)
  const [apiResponses, setApiResponses] = useState<{timestamp: string, endpoint: string, response: any}[]>([])
  
  // Use refs to ensure up-to-date values in intervals and callbacks
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasDataRef = useRef<boolean>(false);
  const resultDataRef = useRef<any>(null);
  
  // Logging function
  const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    const now = new Date()
    const timestamp = now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0')
    setLogs(prev => [...prev, { timestamp, message, type }])
  }
  
  // Add API response to history
  const addApiResponse = (endpoint: string, response: any) => {
    const now = new Date()
    const timestamp = now.toLocaleTimeString() + '.' + now.getMilliseconds().toString().padStart(3, '0')
    setApiResponses(prev => [...prev, { timestamp, endpoint, response }])
  }
  
  // Clear logs
  const clearLogs = () => {
    setLogs([])
  }
  
  // Clear API responses
  const clearApiResponses = () => {
    setApiResponses([])
  }
  
  // Update ref when resultData changes
  useEffect(() => {
    resultDataRef.current = resultData;
    hasDataRef.current = resultData !== null;
    
    // If data is received, ensure polling stops
    if (resultData !== null) {
      stopPolling();
    }
  }, [resultData]);
  
  // Reset all states
  const resetAll = () => {
    clearLogs()
    clearApiResponses()
    setSnapshotId(null)
    setResultData(null)
    hasDataRef.current = false;
    resultDataRef.current = null;
    setIsTesting(false)
    stopPolling()
  }

  // Stop polling - guaranteed to clear interval
  const stopPolling = () => {
    console.log('STOPPING ALL POLLING');
    if (intervalRef.current) {
      console.log('Clearing interval ID:', intervalRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAutoPollingActive(false);
  }

  // Initial API request to get snapshot ID
  const triggerLinkedInApi = async () => {
    // Prevent starting if we already have data
    if (hasDataRef.current || resultData !== null) {
      addLog('Data already exists. Reset to start a new test.', 'info');
      return;
    }
    
    if (!apiKey || !linkedinUrl) {
      addLog('API key and LinkedIn URL are required', 'error')
      return
    }
    
    resetAll()
    setIsTesting(true)
    addLog('Starting LinkedIn API test...', 'info')
    addLog(`Target URL: ${linkedinUrl}`, 'info')
    
    try {
      // Use our proxy API endpoint instead of calling Brightdata directly
      addLog('Triggering Brightdata API request...', 'info')
      
      const response = await fetch('/api/linkedin/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: linkedinUrl,
          apiKey: apiKey
        })
      })
      
      const data = await response.json()
      
      // Save raw API response
      addApiResponse('trigger', data)
      
      if (!response.ok) {
        throw new Error(data.error || `API failed with status: ${response.status}`)
      }
      
      addLog('API request successful', 'success')
      console.log('API response:', data)
      
      if (data.snapshot_id) {
        setSnapshotId(data.snapshot_id)
        addLog(`Snapshot ID received: ${data.snapshot_id}`, 'success')
        
        // Start polling automatically if enabled
        if (isPolling) {
          startPolling(data.snapshot_id);
        }
      } else {
        throw new Error('No snapshot ID returned from API')
      }
    } catch (error) {
      console.error('LinkedIn API test error:', error)
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error')
    } finally {
      setIsTesting(false)
    }
  }
  
  // Start polling with clean state
  const startPolling = (id: string) => {
    // First, ensure any existing interval is cleared
    stopPolling();
    
    // Then start a new interval
    addLog('Auto-polling enabled, fetching snapshot data in 10 seconds...', 'info');
    setAutoPollingActive(true);
    
    // Create new interval with safety checks
    const interval = setInterval(() => {
      // Always check current refs before proceeding
      if (hasDataRef.current || resultDataRef.current !== null) {
        console.log('Data already exists in interval - stopping polling');
        stopPolling();
        return;
      }
      
      console.log('Polling interval triggered, checking for data');
      fetchSnapshotData(id);
    }, 10000);
    
    // Store interval ID in ref for reliable clearing
    intervalRef.current = interval;
    console.log('Started polling with interval ID:', interval);
  }
  
  // Fetch snapshot data
  const fetchSnapshotData = async (id: string) => {
    // Don't fetch if we already have data - check both state and ref
    if (hasDataRef.current || resultData !== null) {
      addLog('Data already received, stopping polling', 'info');
      stopPolling();
      return;
    }
    
    if (!id) {
      addLog('No snapshot ID provided', 'error');
      return;
    }
    
    // Additional guard - don't allow overlapping requests
    if (isTesting) {
      console.log('Already testing, skipping this fetch cycle');
      return;
    }
    
    addLog(`Fetching snapshot data for ID: ${id}...`, 'info');
    setIsTesting(true);
    
    try {
      // Use our proxy API endpoint instead of calling Brightdata directly
      const response = await fetch(`/api/linkedin/snapshot?id=${id}&apiKey=${encodeURIComponent(apiKey)}`)
        .catch(error => {
          console.error('Network error during fetch:', error);
          throw new Error('Network error: Failed to connect to the API server');
        });
      
      const data = await response.json()
        .catch(error => {
          console.error('Error parsing API response:', error);
          throw new Error('Failed to parse API response');
        });
      
      // Save raw API response
      addApiResponse('snapshot', data);
      
      if (!response.ok) {
        throw new Error(data.error || `API failed with status: ${response.status}`);
      }
      
      console.log('Snapshot data received:', data);
      
      // Check if response indicates the snapshot is still processing
      if (data && data.status === 'running') {
        addLog(`${data.message || 'Snapshot is still processing'}`, 'info');
        return; // Continue polling
      }
      
      // Successfully received data - stop polling BEFORE processing
      if (Array.isArray(data) && data.length > 0) {
        // Check if we have a valid profile (with at least basic information)
        if (data[0].name || data[0].id || data[0].linkedin_id) {
          // CRITICAL: Stop polling before anything else
          stopPolling();
          
          // Set our reference to true to prevent any future API calls
          hasDataRef.current = true;
          
          // Update state with the data
          setResultData(data[0]);
          addLog('Successfully retrieved LinkedIn profile data!', 'success');
          
          // Store in database if enabled and user is authenticated
          if (saveToDb && user) {
            await storeProfileData(data[0]);
          }
          return;
        }
      }
      
      // Data received but not in the expected format
      addLog('Received response but data format was unexpected. Will continue polling.', 'info');
      
    } catch (error) {
      console.error('Fetch snapshot error:', error);
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
      
      // If it's a serious error, stop polling
      if (error instanceof Error && (
          error.message.includes('404') || 
          error.message.includes('Network error') ||
          error.message.includes('Failed to connect')
        )) {
        stopPolling();
        addLog('Stopping polling due to connection error', 'error');
      }
    } finally {
      setIsTesting(false);
    }
  }
  
  // Store profile data in database
  const storeProfileData = async (profileData: any) => {
    if (!user) {
      addLog('Cannot store data: No user authenticated', 'error');
      return;
    }
    
    try {
      addLog('Storing profile data in database...', 'info');
      
      // You would implement your Supabase storage logic here
      addLog('Data stored successfully (not implemented in test environment)', 'success');
      
      // CRITICAL: Double-check polling is completely stopped
      stopPolling();
      
    } catch (error) {
      console.error('Error storing profile:', error);
      addLog(`Database error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  }
  
  // Manual fetch handler with safety checks
  const handleManualFetch = () => {
    // Multiple checks to ensure we don't fetch if data exists
    if (hasDataRef.current || resultData !== null) {
      addLog('Data already received. No need to fetch again.', 'info');
      return;
    }
    
    if (!snapshotId) {
      addLog('No snapshot ID available.', 'error');
      return;
    }
    
    fetchSnapshotData(snapshotId);
  }
  
  // Copy JSON to clipboard
  const copyJsonToClipboard = (json: any) => {
    if (!json) return;
    
    try {
      navigator.clipboard.writeText(JSON.stringify(json, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      addLog('JSON copied to clipboard', 'success');
    } catch (error) {
      addLog('Failed to copy to clipboard', 'error');
    }
  }
  
  // Download JSON
  const downloadJson = (json: any, filename: string = "linkedin_profile.json") => {
    if (!json) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    addLog(`JSON file "${filename}" downloaded`, 'success');
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Ensure interval is cleared when component unmounts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
  
  return (
    <>
      <Navbar />
      <Container>
        <div className="pt-24 pb-12">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>LinkedIn API Test Console</CardTitle>
              <CardDescription>
                Test LinkedIn profile data extraction with the Brightdata API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
                  <Input 
                    id="linkedin-url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/username/"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="api-key">Brightdata API Key</Label>
                  <Input 
                    id="api-key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    type="password"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-poll" 
                  checked={isPolling}
                  onCheckedChange={setIsPolling}
                />
                <Label htmlFor="auto-poll">Auto-poll for results every 10 seconds</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="save-to-db" 
                  checked={saveToDb}
                  onCheckedChange={setSaveToDb}
                />
                <Label htmlFor="save-to-db">Save results to database</Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={triggerLinkedInApi}
                  disabled={isTesting || !apiKey || !linkedinUrl || resultData !== null || hasDataRef.current}
                  className="gap-2"
                >
                  {isTesting ? <LuLoader className="animate-spin h-4 w-4" /> : <LuSend className="h-4 w-4" />}
                  Start API Test
                </Button>
                
                {snapshotId && !resultData && !hasDataRef.current && (
                  <Button
                    onClick={handleManualFetch}
                    disabled={isTesting || !apiKey || autoPollingActive}
                    variant="outline"
                    className="gap-2"
                  >
                    {isTesting ? <LuLoader className="animate-spin h-4 w-4" /> : <LuRefreshCcw className="h-4 w-4" />}
                    Fetch Data Now
                  </Button>
                )}
                
                {autoPollingActive && !resultData && !hasDataRef.current && (
                  <Button
                    onClick={stopPolling}
                    variant="secondary"
                    className="gap-2"
                  >
                    Stop Auto-polling
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={clearLogs}
                  size="sm"
                >
                  Clear Logs
                </Button>
                <Button
                  variant="destructive"
                  onClick={resetAll}
                  size="sm"
                >
                  Reset All
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="min-h-[350px] max-h-[600px] flex flex-col">
              <CardHeader className="flex-none">
                <CardTitle className="flex items-center gap-2">
                  <LuTerminal className="h-5 w-5" />
                  Debug Console
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto p-0 border-y">
                <div className="font-mono text-xs p-4 bg-black text-green-400 h-full overflow-auto">
                  {logs.length === 0 ? (
                    <div className="text-gray-500 italic">No logs yet. Start a test to see output.</div>
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
              </CardContent>
              <CardFooter className="flex-none pt-3 pb-3">
                {snapshotId && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold">Snapshot ID:</span> {snapshotId}
                  </div>
                )}
              </CardFooter>
            </Card>
            
            <Card className="min-h-[350px] max-h-[600px] flex flex-col">
              <CardHeader className="flex-none flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <LuInfo className="h-5 w-5" />
                  Result Data
                </CardTitle>
                
                {resultData && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyJsonToClipboard(resultData)}
                      className="gap-1"
                    >
                      {copySuccess ? (
                        <>
                          <LuCheck className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <LuCopy className="h-4 w-4" />
                          Copy JSON
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadJson(resultData, "linkedin_profile.json")}
                      className="gap-1"
                    >
                      <LuDownload className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow overflow-auto p-0 border-y">
                <Tabs defaultValue="json" className="w-full h-full">
                  <div className="border-b px-4">
                    <TabsList>
                      <TabsTrigger value="json">JSON</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="api-responses">API Responses</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="json" className="h-full m-0">
                    <div className="font-mono text-xs p-4 h-full overflow-auto">
                      {resultData ? (
                        <pre>{JSON.stringify(resultData, null, 2)}</pre>
                      ) : (
                        <div className="text-muted-foreground italic">No data available. Run a test and fetch results to view data.</div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="h-full m-0">
                    {resultData ? (
                      <div className="p-4 overflow-auto h-full">
                        <div className="flex gap-3 mb-4">
                          {resultData.avatar && (
                            <img 
                              src={resultData.avatar} 
                              alt="Profile" 
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-bold">{resultData.name || 'Unknown'}</h3>
                            <p className="text-sm text-muted-foreground">{resultData.position || 'No position'}</p>
                            <p className="text-sm text-muted-foreground">{resultData.location || 'No location'}</p>
                          </div>
                        </div>
                        
                        {resultData.about && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1">About</h4>
                            <p className="text-sm">{resultData.about}</p>
                          </div>
                        )}
                        
                        {resultData.experience && resultData.experience.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1">Experience</h4>
                            <ul className="text-sm space-y-2">
                              {resultData.experience.map((exp: any, i: number) => (
                                <li key={i}>
                                  <div className="font-medium">{exp.company}</div>
                                  <div>{exp.positions && exp.positions[0]?.title}</div>
                                  <div className="text-xs text-muted-foreground">{exp.duration}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {resultData.education && resultData.education.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1">Education</h4>
                            <ul className="text-sm space-y-2">
                              {resultData.education.map((edu: any, i: number) => (
                                <li key={i}>
                                  <div className="font-medium">{edu.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {edu.degree} {edu.field ? `- ${edu.field}` : ''}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {edu.start_year} - {edu.end_year || 'Present'}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {resultData.projects && resultData.projects.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-1">Projects</h4>
                            <ul className="text-sm space-y-2">
                              {resultData.projects.map((project: any, i: number) => (
                                <li key={i}>
                                  <div className="font-medium">{project.title}</div>
                                  {project.start_date && (
                                    <div className="text-xs text-muted-foreground">
                                      {project.start_date} {project.end_date ? `- ${project.end_date}` : ''}
                                    </div>
                                  )}
                                  {project.description && (
                                    <div className="text-xs mt-1">{project.description}</div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-muted-foreground italic">
                        No data available for preview.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="api-responses" className="h-full m-0">
                    <div className="flex flex-col h-full">
                      <div className="p-2 bg-slate-100 flex justify-between items-center">
                        <div className="text-sm font-medium">Raw API Responses</div>
                        {apiResponses.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearApiResponses}
                            >
                              Clear
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadJson(apiResponses, "api_responses.json")}
                              className="gap-1"
                            >
                              <LuDownload className="h-3 w-3" />
                              Download All
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="font-mono text-xs p-4 overflow-auto flex-grow">
                        {apiResponses.length === 0 ? (
                          <div className="text-muted-foreground italic">No API responses recorded yet.</div>
                        ) : (
                          <div className="space-y-4">
                            {apiResponses.map((item, index) => (
                              <div key={index} className="border rounded-md p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="font-semibold flex items-center gap-1">
                                    <LuCode className="h-4 w-4" /> 
                                    <span className="text-blue-600">{item.endpoint}</span> API Response
                                  </div>
                                  <div className="text-xs text-gray-500">{item.timestamp}</div>
                                </div>
                                <pre className="bg-slate-50 p-2 rounded overflow-auto max-h-80">
                                  {JSON.stringify(item.response, null, 2)}
                                </pre>
                                <div className="mt-2 flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => copyJsonToClipboard(item.response)}
                                  >
                                    <LuCopy className="h-3 w-3 mr-1" /> Copy
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => downloadJson(
                                      item.response, 
                                      `${item.endpoint}_${item.timestamp.replace(/:/g,'_')}.json`
                                    )}
                                  >
                                    <LuDownload className="h-3 w-3 mr-1" /> Download
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </>
  )
} 