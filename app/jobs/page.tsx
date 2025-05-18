import { Metadata } from 'next'
import { Suspense } from 'react'
import { Navbar } from '@/components/navbar'
import RoleGuard from '@/components/auth/role-guard'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/page-container'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Jobs | findr.ai',
  description: 'Find your perfect tech job with AI-powered matching',
}

// Components for job listings
function JobsPageSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )
}

function ListingGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {children}
    </div>
  )
}

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  tags: string[]
  date: string
}

function JobCard({ id, title, company, location, salary, description, tags, date }: JobCardProps) {
  const postedDate = new Date(date)
  const timeAgo = getTimeAgo(postedDate)
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="text-base mt-1">{company} • {location}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        <p className="text-sm font-medium mb-3">{salary}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Posted {timeAgo}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">View Details</Button>
        <Button size="sm">Apply Now</Button>
      </CardFooter>
    </Card>
  )
}

// Helper function to format dates
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

export default function JobsPage() {
  return (
    <>
      <Navbar />
      <PageContainer>
        <RoleGuard allowedRoles={['applicant']}>
          <h1 className="text-3xl font-bold mb-8">Find Your Next Job</h1>
          
          <div className="mb-8 bg-muted/30 p-4 rounded-lg border">
            <p className="text-muted-foreground">
              This is a demo page showing job listings. In a real application, this would display actual job listings from our database with filtering and search capabilities.
            </p>
          </div>
          
          <Suspense fallback={<JobsPageSkeleton />}>
            <ListingGrid>
              {Array.from({ length: 8 }).map((_, i) => (
                <JobCard 
                  key={i}
                  id={`job-${i}`}
                  title={["Software Engineer", "Product Manager", "UX Designer", "Data Scientist", "DevOps Engineer"][i % 5]}
                  company={["TechCorp", "InnovateSoft", "DesignHub", "DataWorks", "CloudSys"][i % 5]}
                  location={["Remote", "San Francisco, CA", "New York, NY", "Austin, TX", "London, UK"][i % 5]}
                  salary={["$120k - $150k", "$130k - $160k", "$110k - $140k", "$140k - $170k", "$100k - $130k"][i % 5]}
                  description="This is a sample job description. In a real application, this would contain details about the position, requirements, and company information."
                  tags={["full-time", "remote", "senior", "javascript", "react"]}
                  date={new Date(Date.now() - i * 86400000 * 3).toISOString()} // posted every 3 days
                />
              ))}
            </ListingGrid>
            
            <div className="mt-8 flex justify-center">
              <Button variant="outline" size="lg">
                Load More Jobs
              </Button>
            </div>
          </Suspense>
        </RoleGuard>
      </PageContainer>
    </>
  )
} 