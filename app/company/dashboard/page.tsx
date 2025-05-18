import { Metadata } from 'next'
import UserProfile from '@/components/auth/user-profile'
import { Navbar } from '@/components/navbar'
import RoleGuard from '@/components/auth/role-guard'

export const metadata: Metadata = {
  title: 'Company Dashboard',
  description: 'Manage your job listings and company profile',
}

// The actual dashboard content component
function CompanyDashboardContent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">Company Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <UserProfile />
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Your Job Listings</h2>
                <div className="py-8 text-center text-gray-500">
                  No job listings yet. Create your first job post!
                </div>
              </div>
              
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
                <div className="py-8 text-center text-gray-500">
                  No applications received yet.
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
export default function CompanyDashboardPage() {
  return (
    <RoleGuard allowedRoles={['company']}>
      <CompanyDashboardContent />
    </RoleGuard>
  )
} 