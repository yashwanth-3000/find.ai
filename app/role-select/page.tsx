import { Metadata } from 'next'
import RoleSelector from '@/components/auth/role-selector'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Select Your Role',
  description: 'Choose how you want to use Findr',
}

export default function RoleSelectionPage() {
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