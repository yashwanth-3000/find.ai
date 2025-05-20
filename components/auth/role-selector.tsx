'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LuLoader, LuBriefcase, LuUser } from 'react-icons/lu'
import { UserRole } from '@/lib/supabase-types'
import { useRouter } from 'next/navigation'

export default function RoleSelector() {
  const { updateUserRole, userProfile, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const router = useRouter()

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const success = await updateUserRole(selectedRole)

      if (success) {
        // Redirect to the appropriate dashboard
        const route = selectedRole === 'applicant' ? '/applicant/dashboard' : '/company/dashboard'
        router.push(route)
        setTimeout(() => {
          window.location.reload()
        }, 200)
      } else {
        setError('Failed to update role. Please try again.')
      }
    } catch (err) {
      console.error('Role selection error:', err)
      setError('An error occurred while setting your role')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user already has a role, redirect to the appropriate dashboard
  if (userProfile?.role && !loading) {
    const route = userProfile.role === 'applicant' ? '/applicant/dashboard' : '/company/dashboard'
    router.push(route)
    return <div>Redirecting...</div>
  }

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Choose Your Role</CardTitle>
          <CardDescription>
            Select how you want to use the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedRole === 'applicant' ? 'default' : 'outline'}
              className="h-28 flex flex-col items-center justify-center gap-2 p-4"
              onClick={() => setSelectedRole('applicant')}
              disabled={isSubmitting}
            >
              <LuUser className="h-8 w-8" />
              <span>Applicant</span>
              <span className="text-xs text-center">Looking for opportunities</span>
            </Button>

            <Button
              variant={selectedRole === 'company' ? 'default' : 'outline'}
              className="h-28 flex flex-col items-center justify-center gap-2 p-4"
              onClick={() => setSelectedRole('company')}
              disabled={isSubmitting}
            >
              <LuBriefcase className="h-8 w-8" />
              <span>Company</span>
              <span className="text-xs text-center">Hiring talent</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleRoleSelection}
            disabled={!selectedRole || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                Setting up your account...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 