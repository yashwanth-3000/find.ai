import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import RoleSelector from '@/components/auth/role-selector'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Dashboard - Choose Your Role',
  description: 'Select how you want to use Findr.ai',
}

export default async function DashboardPage() {
  // Server-side check for user's role
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // If no session, redirect to sign in
    redirect('/signin')
  }
  
  // Check if the user already has a role
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  // If user has a role, redirect to the appropriate dashboard
  if (userProfile?.role === 'applicant') {
    redirect('/applicant/dashboard')
  } else if (userProfile?.role === 'company') {
    redirect('/company/dashboard')
  }
  
  // No role yet, show the role selector
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container max-w-xl py-12">
          <h1 className="text-3xl font-bold text-center mb-8">Welcome to Findr</h1>
          <p className="text-center text-gray-500 mb-8">
            Please select your role to get started with Findr.ai
          </p>
          <RoleSelector />
        </div>
      </main>
    </div>
  )
} 