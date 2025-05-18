import { Metadata } from 'next'
import RoleSelectorCards from '@/components/auth/role-selector-cards'

export const metadata: Metadata = {
  title: 'Select Your Role | findr.ai',
  description: 'Choose whether you want to use findr.ai as a job applicant or a company.'
}

export default function RoleSelectorPage() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold sm:text-4xl">Select Your Role</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Choose how you want to use findr.ai. This will personalize your 
          experience and provide you with the tools you need.
        </p>
      </div>
      
      {/* Render the role selector cards directly - they have their own loading state handling */}
      <RoleSelectorCards />
    </div>
  )
} 