'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RoleGuard from '@/components/auth/role-guard'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { LuPlus, LuPenLine, LuEye, LuUsers, LuLoader } from 'react-icons/lu'
import { Container } from '@/components/layout/container'
import { PageContainer } from '@/components/layout/page-container'
import { formatDistance } from 'date-fns'

export default function ManageJobsPage() {
  const { user, supabase } = useAuth()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  
  // Fetch jobs from the database
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setJobs(data || [])
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [user, supabase])
  
  // Filter jobs by status
  const filteredJobs = jobs.filter(job => job.status === activeTab)
  
  // Get applicant count for a job (would be implemented with real data)
  const getApplicantCount = (jobId: string) => {
    // In a real app, this would fetch the actual count from the database
    return Math.floor(Math.random() * 20) // Placeholder for demo
  }
  
  // Format posted date
  const formatPostedDate = (date: string) => {
    try {
      return formatDistance(new Date(date), new Date(), { addSuffix: true })
    } catch (e) {
      return 'Unknown date'
    }
  }

  return (
    <>
      <Navbar />
      <PageContainer>
        <RoleGuard allowedRoles={['company']}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Jobs</h1>
            <Button asChild>
              <Link href="/company/jobs/new">
                <LuPlus className="mr-2 h-4 w-4" /> Post a New Job
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex flex-col justify-center items-center p-12 gap-4">
              <LuLoader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Loading... If not loaded in 3 seconds, please refresh the page</p>
            </div>
          ) : jobs.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No Jobs Posted Yet</h3>
              <p className="text-muted-foreground mb-6">Start posting jobs to attract qualified applicants for your company.</p>
              <Button asChild>
                <Link href="/company/jobs/new">
                  <LuPlus className="mr-2 h-4 w-4" /> Post Your First Job
                </Link>
              </Button>
            </Card>
          ) : (
            <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {filteredJobs.length === 0 ? (
                  <div className="text-center p-12 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">No active jobs found. Activate your draft jobs or post a new job.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {filteredJobs.map((job) => (
                      <JobCard 
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        location={job.location}
                        posted={formatPostedDate(job.created_at)}
                        applicants={getApplicantCount(job.id)}
                        status="active"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="draft">
                {filteredJobs.length === 0 ? (
                  <div className="text-center p-12 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">No draft jobs found. Save a job as draft when creating a new job.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {filteredJobs.map((job) => (
                      <JobCard 
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        location={job.location}
                        posted="Draft"
                        applicants={0}
                        status="draft"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="closed">
                {filteredJobs.length === 0 ? (
                  <div className="text-center p-12 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">No closed jobs found. You can close active jobs when they're no longer accepting applications.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {filteredJobs.map((job) => (
                      <JobCard 
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        location={job.location}
                        posted={`Closed ${formatPostedDate(job.updated_at)}`}
                        applicants={getApplicantCount(job.id)}
                        status="closed"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </RoleGuard>
      </PageContainer>
    </>
  )
}

interface JobCardProps {
  id: string
  title: string
  location: string
  posted: string
  applicants: number
  status: 'active' | 'draft' | 'closed'
}

function JobCard({ id, title, location, posted, applicants, status }: JobCardProps) {
  return (
    <div className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 className="font-medium text-lg">{title}</h3>
        <p className="text-muted-foreground">{location}</p>
        <p className="text-sm text-muted-foreground mt-1">{posted}</p>
      </div>
      
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        {status === 'active' && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/company/jobs/${id}/applicants`}>
              <LuUsers className="mr-1 h-4 w-4" /> {applicants} Applicants
            </Link>
          </Button>
        )}
        
        <Button variant="outline" size="sm" asChild>
          <Link href={`/company/jobs/${id}/edit`}>
            <LuPenLine className="mr-1 h-4 w-4" /> Edit
          </Link>
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <Link href={`/company/jobs/${id}`}>
            <LuEye className="mr-1 h-4 w-4" /> View
          </Link>
        </Button>
      </div>
    </div>
  )
} 