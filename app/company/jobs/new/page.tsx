import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import RoleGuard from '@/components/auth/role-guard'
import { LuBriefcase, LuMapPin, LuDollarSign, LuClock, LuSave } from 'react-icons/lu'
import { Container } from '@/components/layout/container'
import { Separator } from '@/components/ui/separator'
import { PageContainer } from '@/components/layout/page-container'

export const metadata: Metadata = {
  title: 'Post a New Job | findr.ai',
  description: 'Create a new job listing for your company',
}

export default function NewJobPage() {
  return (
    <>
      <Navbar />
      <PageContainer>
        <RoleGuard allowedRoles={['company']}>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
            
            <div className="mb-8 bg-muted/30 p-4 rounded-lg border">
              <p className="text-muted-foreground">
                This is a demo page for posting a new job. In a real application, this form would save data to the database.
              </p>
            </div>
            
            <form className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Job Details</h2>
                <Separator />
                
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input id="job-title" placeholder="e.g. Senior Frontend Developer" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="job-type">Job Type</Label>
                      <Select defaultValue="full-time">
                        <SelectTrigger id="job-type">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="job-location">Location</Label>
                      <Input id="job-location" placeholder="e.g. Remote, San Francisco, CA" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="min-salary">Salary Range (Min)</Label>
                      <Input id="min-salary" placeholder="Min salary" type="number" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="max-salary">Salary Range (Max)</Label>
                      <Input id="max-salary" placeholder="Max salary" type="number" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Job Description</h2>
                <Separator />
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the role, responsibilities, and your company..."
                    className="min-h-[150px]"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea 
                    id="requirements" 
                    placeholder="List the key requirements and qualifications..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea 
                    id="benefits" 
                    placeholder="Describe the benefits and perks..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 justify-end">
                <Button variant="outline">Save as Draft</Button>
                <Button>Publish Job</Button>
              </div>
            </form>
          </div>
        </RoleGuard>
      </PageContainer>
    </>
  )
} 