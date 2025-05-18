'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { LuLoader, LuBriefcase, LuUser, LuChevronRight, LuCheck, LuInfo, LuRefreshCw, LuRotateCcw } from 'react-icons/lu'
import { IoAlertCircle, IoCheckmarkCircleOutline } from 'react-icons/io5'
import { UserRole } from '@/lib/supabase-types'
import { debugAuthState, fixUserProfile } from '@/lib/auth-utils'

export default function RoleSelectorCards() {
  const { updateUserRole, user, userProfile, refreshSession, loading, supabase, resetAuthState } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [isFixingProfile, setIsFixingProfile] = useState(false)
  const [profileFixed, setProfileFixed] = useState(false)
  const router = useRouter()
  
  // Add a timeout to prevent the loading state from getting stuck
  useEffect(() => {
    // If loading is taking too long, allow the user to retry
    const timer = setTimeout(() => {
      if ((loading || isRefreshing) && !user) {
        setLoadingTimeout(true)
      }
    }, 5000) // 5 second timeout
    
    return () => clearTimeout(timer)
  }, [loading, isRefreshing, user])
  
  // On mount, log auth state and reset any session markers
  useEffect(() => {
    console.log('Role selector mounted, auth state:', { 
      user: !!user, 
      loading,
      userProfile: !!userProfile,
      sessionKey: localStorage.getItem('sb-auth-token') ? 'exists' : 'missing' 
    });
    
    // For debugging
    if (typeof window !== 'undefined') {
      debugAuthState();
    }
  }, [user, loading, userProfile]);
  
  // Directly check Supabase session when component mounts
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsRefreshing(true);
        console.log('Checking Supabase session directly');
        
        // Get current session from Supabase
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Session error: ' + sessionError.message);
          return;
        }
        
        if (!currentSession) {
          console.warn('No active session found');
          // Instead of redirecting, set error message for display
          setError('No active session found. Please sign in again.');
          return;
        }
        
        console.log('Session found for user:', currentSession.user.id);
        
        // If we have a session but no user in context, refresh to load user
        if (currentSession && !user) {
          console.log('Session exists but user not in context, refreshing');
          await refreshSession();
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError('Failed to verify your authentication status.');
      } finally {
        setIsRefreshing(false);
      }
    };
    
    // Only check if not already loading
    if (!loading && !user) {
      checkSession();
    }
  }, [supabase, refreshSession, user, loading]);

  // Handle fixing profile issues
  const handleFixProfile = async () => {
    setIsFixingProfile(true)
    setError(null)
    
    try {
      const success = await fixUserProfile()
      
      if (success) {
        setProfileFixed(true)
        console.log('Profile fixed successfully')
        setTimeout(() => {
          refreshSession()
        }, 1000)
      } else {
        setError('Failed to fix profile. Please try again.')
      }
    } catch (err) {
      setError('Error fixing profile: ' + (err as Error).message)
    } finally {
      setIsFixingProfile(false)
    }
  }

  const handleSelectRole = async (role: UserRole) => {
    try {
      if (!user) {
        console.error('Attempting to set role without valid user');
        setError('Your session appears to be invalid. Please try signing in again.');
        return;
      }
      
      setIsSubmitting(true);
      setError(null);
      setSelectedRole(role);

      console.log(`Attempting to set role to: ${role} for user ID: ${user.id}`);
      
      // Check if profile exists first
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      // If profile doesn't exist, create it using our fix-profile endpoint
      if (!profile || profileError) {
        console.log('Profile not found or error occurred, creating one first...');
        
        try {
          // Use our fixUserProfile helper
          const success = await fixUserProfile(role);
          
          if (!success) {
            throw new Error('Failed to create profile before role selection');
          }
          
          console.log('Profile created successfully with role', role);
          
          // Refresh to make sure we have latest state
          await refreshSession();
          
          // Update profile status
          setProfileFixed(true);
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push('/');
          }, 1000);
          
          return;
        } catch (createErr) {
          console.error('Error creating profile:', createErr);
          setError('Could not create your profile. Please try signing in again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Direct database update for more reliability
      try {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ role })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Direct role update failed:', updateError);
          
          // Try using our fix-profile endpoint as a fallback
          const success = await fixUserProfile(role);
          
          if (!success) {
            // Last resort, try the context method
            const contextSuccess = await updateUserRole(role);
            
            if (!contextSuccess) {
              setError('Failed to update your role. Please try again.');
              setIsSubmitting(false);
              return;
            }
          }
        }
        
        console.log(`Role updated successfully to: ${role}`);
        
        // Force delay before redirect to ensure state is updated
        setTimeout(() => {
          // Redirect to the home page instead of dashboard
          router.push('/');
        }, 800);
      } catch (updateErr) {
        console.error('Error during role update:', updateErr);
        setError('Database error while updating role. Please try again.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error setting role:', err);
      setError('An error occurred while updating your role. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle a force refresh when something seems wrong
  const handleForceRefresh = async () => {
    try {
      console.log('Forcing a refresh of the authentication state');
      setIsRefreshing(true);
      setLoadingTimeout(false);
      setError(null);
      
      // First try a normal refresh
      await refreshSession();
      
      // Then check directly with Supabase
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        console.log('No session found after force refresh');
        setError('No active session found. You need to sign in again.');
      } else {
        console.log('Session refreshed for user:', data.session.user.id);
      }
    } catch (err) {
      console.error('Error during force refresh:', err);
      setError('Something went wrong. Please try signing in again.');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Reset the auth state completely
  const handleResetAuth = () => {
    console.log('Performing complete auth state reset');
    setLoadingTimeout(false);
    setError(null);
    setIsRefreshing(true);
    
    // Reset the auth state in context
    resetAuthState();
    
    // Set a timeout to stop refreshing state after a delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 2000);
  };

  // Show loading state when initial auth check or session refresh is happening
  if ((loading || isRefreshing) && !loadingTimeout) {
    return (
      <div className="text-center py-12">
        <LuLoader className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          {loading ? 'Checking authentication status...' : 'Refreshing your session...'}
        </p>
      </div>
    );
  }
  
  // If loading is taking too long, show a timeout message with retry option
  if ((loading || isRefreshing) && loadingTimeout) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <LuInfo className="mx-auto h-8 w-8 text-amber-500" />
          <h3 className="mt-2 text-lg font-semibold text-amber-700">Taking longer than expected</h3>
          <p className="mt-2 text-sm text-amber-600">
            It's taking a while to verify your authentication status. You can wait a bit longer or try refreshing.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button 
              className="w-full"
              variant="default"
              onClick={handleForceRefresh}
            >
              <LuRefreshCw className="mr-2 h-4 w-4" />
              Refresh Session
            </Button>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleResetAuth}
            >
              <LuRotateCcw className="mr-2 h-4 w-4" />
              Reset Authentication
            </Button>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleFixProfile}
              disabled={isFixingProfile}
            >
              {isFixingProfile ? (
                <>
                  <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                  Fixing Profile...
                </>
              ) : (
                <>
                  <LuCheck className="mr-2 h-4 w-4" />
                  Fix Profile Issue
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Select Your Role</h1>
        <p className="text-muted-foreground">
          Choose a role to customize your experience on our platform
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center space-x-2 w-full max-w-md mx-auto mb-6">
          <IoAlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {profileFixed && !error && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center space-x-2 w-full max-w-md mx-auto mb-6">
          <IoCheckmarkCircleOutline className="h-5 w-5 flex-shrink-0" />
          <span>Profile updated successfully! Redirecting...</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className={`cursor-pointer transition-all ${selectedRole === 'applicant' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`} onClick={() => handleSelectRole('applicant')}>
          <CardHeader className="pb-2">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
              <LuUser className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl">Applicant</CardTitle>
            <CardDescription>
              Looking for opportunities and want to showcase your skills
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <LuCheck className="text-green-600 h-5 w-5 flex-shrink-0" />
                <span>Create a professional profile</span>
              </li>
              <li className="flex items-center gap-2">
                <LuCheck className="text-green-600 h-5 w-5 flex-shrink-0" />
                <span>Browse and apply for jobs</span>
              </li>
              <li className="flex items-center gap-2">
                <LuCheck className="text-green-600 h-5 w-5 flex-shrink-0" />
                <span>Connect with companies</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full group" variant={selectedRole === 'applicant' ? 'default' : 'outline'}>
              {selectedRole === 'applicant' && isSubmitting ? (
                <LuLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LuChevronRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              )}
              {selectedRole === 'applicant' && isSubmitting ? 'Setting role...' : 'Select Applicant Role'}
            </Button>
          </CardFooter>
        </Card>

        <Card className={`cursor-pointer transition-all ${selectedRole === 'company' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`} onClick={() => handleSelectRole('company')}>
          <CardHeader className="pb-2">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
              <LuBriefcase className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl">Company</CardTitle>
            <CardDescription>
              Hiring talent and want to promote your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <LuCheck className="text-green-600 h-5 w-5 flex-shrink-0" />
                <span>Create a company profile</span>
              </li>
              <li className="flex items-center gap-2">
                <LuCheck className="text-green-600 h-5 w-5 flex-shrink-0" />
                <span>Post jobs and review applications</span>
              </li>
              <li className="flex items-center gap-2">
                <LuCheck className="text-green-600 h-5 w-5 flex-shrink-0" />
                <span>Connect with potential candidates</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full group" variant={selectedRole === 'company' ? 'default' : 'outline'}>
              {selectedRole === 'company' && isSubmitting ? (
                <LuLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LuChevronRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              )}
              {selectedRole === 'company' && isSubmitting ? 'Setting role...' : 'Select Company Role'}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Additional buttons */}
      <div className="flex justify-center gap-4 mt-6">
        {!isSubmitting && (
          <>
            <Button variant="outline" size="sm" onClick={handleForceRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <LuLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LuRefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh Session
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetAuth}>
              <LuRotateCcw className="mr-2 h-4 w-4" />
              Reset Authentication
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFixProfile}
              disabled={isFixingProfile}
            >
              {isFixingProfile ? (
                <>
                  <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <LuCheck className="mr-2 h-4 w-4" />
                  Fix Profile Issue
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 