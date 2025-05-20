'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LuUser, LuBuilding, LuLoader } from 'react-icons/lu'
import { useAuth } from '@/contexts/auth-context'

export default function ProfileRedirectPage() {
  const router = useRouter()
  const { userProfile, loading } = useAuth()
  
  // Simple redirect based on user role
  useEffect(() => {
    if (!loading && userProfile?.role) {
      // If user has a role, redirect to the appropriate edit page
      if (userProfile.role === 'applicant') {
        console.log('[ProfileRedirect] Redirecting to applicant edit page')
        router.push('/applicant/edit')
      } else if (userProfile.role === 'company') {
        console.log('[ProfileRedirect] Redirecting to company edit page')
        router.push('/company/edit')
      }
    }
  }, [userProfile, loading, router])
  
  if (loading) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="pt-24 flex flex-col items-center justify-center min-h-[50vh]">
            <LuLoader className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading your profile...</p>
          </div>
        </Container>
      </>
    )
  }
  
  // If user doesn't have a role yet, show a role selector
  return (
    <>
      <Navbar />
      <Container>
        <div className="pt-24 pb-12">
          <h1 className="text-3xl font-bold mb-2">Choose Profile Type</h1>
          <p className="text-muted-foreground mb-8">
            Please select which type of profile you want to edit
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applicant card */}
            <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white">
                <CardTitle>Job Seeker</CardTitle>
                <CardDescription className="text-emerald-100">
                  For individuals looking for job opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Create a profile to showcase your skills, experience, and education to potential employers.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Apply to job listings
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Showcase your portfolio and skills
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Get discovered by employers
                  </li>
                </ul>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => router.push('/applicant/edit')}
                >
                  <LuUser className="mr-2 h-4 w-4" />
                  Edit Applicant Profile
                </Button>
              </CardContent>
            </Card>
            
            {/* Company card */}
            <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-700 text-white">
                <CardTitle>Employer</CardTitle>
                <CardDescription className="text-purple-100">
                  For companies and organizations hiring talent
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Create a company profile to attract qualified candidates and manage your job postings.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    Post job opportunities
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    Review qualified candidates
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    Build your employer brand
                  </li>
                </ul>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => router.push('/company/edit')}
                >
                  <LuBuilding className="mr-2 h-4 w-4" />
                  Edit Company Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </>
  )
} 