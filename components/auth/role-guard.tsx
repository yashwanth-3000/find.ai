'use client'

import { useAuth } from '@/contexts/auth-context'
import { ReactNode, useEffect } from 'react'
import { UserRole } from '@/lib/supabase-types'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LuLoader } from 'react-icons/lu'
import Link from 'next/link'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[] | 'any'
  fallback?: ReactNode
}

/**
 * A component that guards access to its children based on user role
 * Use this in page components instead of middleware to protect content
 * 
 * @example
 * // Only allow applicants to access a page
 * <RoleGuard allowedRoles={['applicant']}>
 *   <ApplicantContent />
 * </RoleGuard>
 * 
 * @example
 * // Allow any authenticated user
 * <RoleGuard allowedRoles="any">
 *   <UserContent />
 * </RoleGuard>
 */
export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback 
}: RoleGuardProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  
  const hasAccess = () => {
    // If still loading, we don't know yet
    if (loading) return false
    
    // Must be logged in
    if (!user || !userProfile) return false
    
    // Allow any authenticated user regardless of role
    if (allowedRoles === 'any') return true
    
    // User must have a role and it must be in the allowed roles list
    return !!userProfile.role && allowedRoles.includes(userProfile.role)
  }

  // Default fallback if none provided
  const defaultFallback = (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      
      {loading ? (
        <div className="flex items-center justify-center">
          <LuLoader className="animate-spin mr-2" />
          <p>Checking access...</p>
        </div>
      ) : !user ? (
        <div className="text-center space-y-4">
          <p className="mb-4">Please sign in to access this page</p>
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      ) : !userProfile?.role ? (
        <div className="text-center space-y-4">
          <p className="mb-4">Please select a role to access this page</p>
          <Button asChild>
            <Link href="/role-selector">Select Role</Link>
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <p>You don't have permission to access this page.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your current role: <span className="font-medium capitalize">{userProfile.role}</span>
          </p>
          <Button asChild className="mt-4" variant="secondary">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      )}
    </div>
  )

  return hasAccess() ? <>{children}</> : (fallback || defaultFallback)
} 