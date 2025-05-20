import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'

interface ProfileEditPageProps {
  params: {
    role: string
  }
}

export default async function ProfileEditRedirect({ params }: ProfileEditPageProps) {
  const { role } = params
  
  // Server-side check for user's role
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // If no session, redirect to sign in
    redirect('/signin')
  }
  
  // Check if the user has a profile
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  
  // Redirect to appropriate simplified route
  if (role === 'applicant') {
    redirect('/applicant/edit')
  } else if (role === 'company') {
    redirect('/company/edit')
  } else {
    // If invalid role parameter, redirect to generic profile editor
    redirect('/edit-profile')
  }
} 