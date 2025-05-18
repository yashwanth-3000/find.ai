import { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import UserProfile from '@/components/auth/user-profile'
import RoleGuard from '@/components/auth/role-guard'

export const metadata: Metadata = {
  title: 'Your Profile | findr.ai',
  description: 'View and edit your profile information',
}

function ProfilePageContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Account Information</h2>
              <UserProfile />
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                This page is accessible to all authenticated users, regardless of their role.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <RoleGuard allowedRoles="any">
      <ProfilePageContent />
    </RoleGuard>
  )
} 