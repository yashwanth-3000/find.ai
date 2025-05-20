import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LuArrowRight, LuUser, LuBuilding } from 'react-icons/lu'

export const metadata: Metadata = {
  title: 'Your Profile',
  description: 'View and manage your profile',
}

export default async function ProfileRedirect() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // Redirect to sign in if not authenticated
    redirect('/signin')
  }
  
  // Get user profile
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  // If no profile, redirect to role selection
  if (!userProfile) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="pt-24 pb-12">
            <Card className="max-w-lg mx-auto">
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Please select a role to continue using the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <p className="text-center text-muted-foreground mb-4">
                  Before you can access your profile, you need to choose whether you're an applicant or a company.
                </p>
                <Button asChild className="w-full">
                  <a href="/role-select" className="flex items-center justify-center gap-2">
                    Select Your Role
                    <LuArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </>
    )
  }
  
  // Redirect to role-specific profile page
  if (userProfile.role === 'applicant') {
    redirect('/applicant/profile')
  } else if (userProfile.role === 'company') {
    redirect('/company/profile')
  } else {
    // If role is not recognized, prompt to select a role
    redirect('/role-select')
  }
} 