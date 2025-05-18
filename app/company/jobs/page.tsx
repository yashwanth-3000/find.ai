import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RoleGuard from '@/components/auth/role-guard'
import Link from 'next/link'
import { LuPlus, LuPenLine, LuEye, LuUsers } from 'react-icons/lu'
import { Container } from '@/components/layout/container'
import { PageContainer } from '@/components/layout/page-container'

export const metadata: Metadata = {
  title: 'Manage Jobs | findr.ai',
  description: 'Manage your company job listings',
}

export default function ManageJobsPage() {
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
          
          <div className="mb-8 bg-muted/30 p-4 rounded-lg border">
            <p className="text-muted-foreground">
              This is a demo page showing your company's job listings. In a real application, this would display actual job listings from our database that your company has posted.
            </p>
          </div>
          
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <div className="grid gap-6">
                <JobCard 
                  id="job-1"
                  title="Senior Frontend Developer"
                  location="Remote"
                  posted="2 days ago"
                  applicants={12}
                  status="active"
                />
                <JobCard 
                  id="job-2"
                  title="Full Stack Engineer"
                  location="San Francisco, CA (Hybrid)"
                  posted="1 week ago"
                  applicants={8}
                  status="active"
                />
              </div>
            </TabsContent>
            <TabsContent value="draft">
              <div className="grid gap-6">
                <JobCard 
                  id="draft-1"
                  title="Product Manager"
                  location="New York, NY"
                  posted="Draft"
                  applicants={0}
                  status="draft"
                />
              </div>
            </TabsContent>
            <TabsContent value="closed">
              <div className="grid gap-6">
                <JobCard 
                  id="closed-1"
                  title="UX Designer"
                  location="Remote"
                  posted="Closed 2 weeks ago"
                  applicants={16}
                  status="closed"
                />
              </div>
            </TabsContent>
          </Tabs>
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