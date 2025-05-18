import { Metadata } from 'next'
import UserProfile from '@/components/auth/user-profile'
import { Navbar } from '@/components/navbar'
import RoleGuard from '@/components/auth/role-guard'

export const metadata: Metadata = {
  title: 'Applicant Dashboard',
  description: 'Manage your job applications and profile',
}

// The actual dashboard content component
function ApplicantDashboardContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">Applicant Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <UserProfile />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Your Job Applications</h2>
                <div className="py-8 text-center text-gray-500">
                  No applications yet. Start exploring jobs!
                </div>
              </div>
              
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Recommended Jobs</h2>
                <div className="py-8 text-center text-gray-500">
                  Complete your profile to see job recommendations.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// This is the page component that uses RoleGuard for protection
export default function ApplicantDashboardPage() {
  return (
    <RoleGuard allowedRoles={['applicant']}>
      <ApplicantDashboardContent />
    </RoleGuard>
  )
} 