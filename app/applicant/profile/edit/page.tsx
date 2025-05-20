import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import ProfileEditor from '@/components/profile/profile-editor'
import { PageContainer } from '@/components/layout/page-container'

export const metadata: Metadata = {
  title: 'Edit Applicant Profile',
  description: 'Update your applicant profile information',
}

export default async function ApplicantProfileEditPage() {
  // Server-side check for user's role
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // If no session, redirect to sign in
    redirect('/signin')
  }
  
  // Check if the user is an applicant
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  if (userProfile?.role !== 'applicant') {
    // If not an applicant, redirect to the role selection page
    redirect('/role-select')
  }
  
  return (
    <>
      <Navbar />
      <PageContainer>
        <h1 className="text-3xl font-bold mb-8">Edit Your Applicant Profile</h1>
        <ProfileEditor />
      </PageContainer>
    </>
  )
} 