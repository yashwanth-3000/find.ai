import { Metadata } from 'next'
import RoleSelector from '@/components/auth/role-selector'
import { Navbar } from '@/components/navbar'
import { createServerClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Select Your Role',
  description: 'Choose how you want to use Findr',
}

export default async function RoleSelectionPage() {
  // Server-side check to see if the user already has a role
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    // Check if the user already has a profile with a role
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    // If user already has a role, redirect to their profile edit page
    if (userProfile?.role === 'applicant' || userProfile?.role === 'company') {
      console.log('User already has role:', userProfile.role)
      redirect(`/edit-profile/${userProfile.role}`)
    }
    
    // If they don't have a role in user_profiles, check if they have a role-specific profile
    if (!userProfile?.role) {
      // Check for applicant profile
      const { data: applicantProfile } = await supabase
        .from('applicant_profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      if (applicantProfile) {
        console.log('Applicant profile found')
        redirect('/edit-profile/applicant')
      }
      
      // Check for company profile
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()
      
      if (companyProfile) {
        console.log('Company profile found')
        redirect('/edit-profile/company')
      }
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container max-w-xl py-12">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome to Findr</h1>
          <RoleSelector />
        </div>
      </main>
    </div>
  )
} 