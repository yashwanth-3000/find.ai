'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useMemo
} from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { UserProfile, UserRole } from '@/lib/supabase-types'
import { Session, SupabaseClient, User } from '@supabase/supabase-js'

// Define the shape of our auth context
interface AuthContextType {
  supabase: SupabaseClient
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  signOut: () => Promise<boolean>
  refreshSession: () => Promise<void>
  resetAuthState: () => void
  signInWithGoogle: () => Promise<void>
  updateUserRole: (role: UserRole) => Promise<boolean>
  isApplicant: boolean
  isCompany: boolean
}

// Create the context with an initial empty value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Define the provider component props
interface AuthProviderProps {
  children: ReactNode
}

// Create the AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Use a memo to create the Supabase client only once
  const supabase = useMemo(() => createBrowserClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use refs to track initialization and prevent multiple fetches
  const initializeRef = useRef(false)
  const profileFetchRef = useRef(false)
  
  const router = useRouter()

  // Computed properties for role-based checks
  const isApplicant = userProfile?.role === 'applicant'
  const isCompany = userProfile?.role === 'company'

  // Function to get the full user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for ID:', userId);
      
      // First check if user exists in user_profiles table
      const { data: directProfile, error: directError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (directProfile) {
        console.log('Found user profile directly:', directProfile);
        return directProfile as UserProfile;
      }
      
      // If profile doesn't exist, try to create one
      if (directError && directError.code === 'PGRST116') { // PGRST116 = not found
        console.log('No profile found, attempting to create one');
        return await createUserProfile(userId);
      }
      
      if (directError) {
        console.error('Error fetching user profile directly:', directError);
      }
      
      // Fall back to RPC method
      console.log('Falling back to RPC method for profile');
      const { data, error } = await supabase.rpc('get_user_profile', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching user profile via RPC:', error);
        return null;
      }

      console.log('User profile from RPC:', data);
      return data as UserProfile;
    } catch (err) {
      console.error('Exception fetching user profile:', err);
      return null;
    }
  };
  
  // Helper to create a user profile directly if it doesn't exist
  const createUserProfile = async (userId: string) => {
    try {
      console.log('Creating new user profile for:', userId);
      
      // Get user details first
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData || !userData.user) {
        console.error('No user data available to create profile');
        return null;
      }
      
      const user = userData.user;
      let displayName = '';
      
      // Try to extract name from metadata (important for OAuth)
      if (user.user_metadata?.full_name) {
        displayName = user.user_metadata.full_name;
      } else if (user.user_metadata?.name) {
        displayName = user.user_metadata.name;
      } else if (user.email) {
        // Fallback to email username
        displayName = user.email.split('@')[0];
      }
      
      const now = new Date().toISOString();
      
      // Create the profile record directly
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: user.email,
          display_name: displayName,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: now,
          updated_at: now
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Failed to create user profile:', error);
        // Try a simplified insert with just the minimum required fields
        if (error.code === '23505') {
          console.log('Profile might already exist, trying to fetch it...');
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (existingProfile) {
            console.log('Found existing profile:', existingProfile);
            return existingProfile as UserProfile;
          }
        }
        
        // Try one more time with minimal data
        console.log('Trying simplified profile creation...');
        const { data: minimalData, error: minimalError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            created_at: now,
            updated_at: now
          })
          .select('*')
          .single();
          
        if (minimalError) {
          console.error('Simplified profile creation also failed:', minimalError);
          return null;
        }
        
        return minimalData as UserProfile;
      }
      
      console.log('Created new user profile:', data);
      return data as UserProfile;
    } catch (err) {
      console.error('Exception creating user profile:', err);
      return null;
    }
  };

  // Reset the auth state completely
  const resetAuthState = () => {
    console.log('Resetting auth state completely');
    setUser(null);
    setUserProfile(null);
    setSession(null);
    setError(null);
    setLoading(true);
    
    // Re-initialize after a brief delay
    setTimeout(() => {
      initializeAuth();
    }, 100);
  };

  // Refresh the session data
  const refreshSession = async () => {
    try {
      setLoading(true);
      console.log('Refreshing session...');
      
      // Force a fresh check directly from Supabase
      const { data: { session: newSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        setError(error.message);
        return;
      }

      if (newSession?.user) {
        console.log('Session found for user:', newSession.user.id);
        setSession(newSession);
        setUser(newSession.user);
        
        // Fetch the user profile with role-specific data
        const profile = await fetchUserProfile(newSession.user.id);
        if (profile) {
          console.log('Profile found during refresh:', profile);
          setUserProfile(profile);
        } else {
          console.warn('No profile found during refresh');
        }
      } else {
        console.log('No session found during refresh');
        setSession(null);
        setUser(null);
        setUserProfile(null);
      }
    } catch (err) {
      console.error('Session refresh error:', err);
      setError('Failed to refresh session');
    } finally {
      setLoading(false);
    }
  };

  // Updated sign out function that uses the server-side endpoint
  const signOut = async () => {
    try {
      console.log('Signing out user via server-side endpoint')
      
      // First update UI state immediately for better UX
      setUser(null)
      setUserProfile(null)
      setSession(null)

      // Use the server-side endpoint to ensure cookies are properly cleared
      window.location.href = '/api/auth/signout?redirectTo=/'
      
      return true
    } catch (err) {
      console.error('Sign out error:', err)
      
      // Even if there's an error, redirect to endpoint
      window.location.href = '/api/auth/signout?redirectTo=/'
      return false
    }
  }

  // Google sign-in function
  const signInWithGoogle = async () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Cannot sign in outside of browser context')
      }

      // Get exact current origin for reliable redirects
      const origin = window.location.origin
      const callbackUrl = `${origin}/auth/callback`
      
      console.log('Starting Google sign-in with callback URL:', callbackUrl)
      
      // Clear any previous auth fragments in URL
      if (window.location.hash || window.location.search.includes('error=')) {
        window.history.replaceState({}, document.title, window.location.pathname)
      }

      // Store timestamp to help debug auth flow
      localStorage.setItem('auth_flow_start', new Date().toISOString())
      
      // Using a fresh client for this operation to avoid any state conflicts
      const freshClient = createBrowserClient()
      
      const { data, error } = await freshClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            // These params help ensure we get a refresh token
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google sign in error:', error.message)
        setError(error.message)
        throw error
      }
      
      console.log('OAuth initialization successful, redirect URL:', data?.url || 'No URL returned')
      
      // If a URL was returned but no redirect happened, force it
      if (data?.url && typeof window !== 'undefined') {
        console.log('Manually navigating to authorization URL')
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Failed to sign in with Google:', err)
      setError('Failed to sign in with Google')
      throw err
    }
  }

  // Update user role function
  const updateUserRole = async (role: UserRole): Promise<boolean> => {
    try {
      if (!user) {
        console.error('Cannot update role: No user is authenticated');
        setError('User must be logged in to select a role');
        return false;
      }

      console.log(`Updating role to ${role} for user ${user.id}`);
      
      // Create profile if it doesn't exist
      if (!userProfile) {
        const newProfile = await createUserProfile(user.id);
        if (!newProfile) {
          setError('Failed to create user profile');
          return false;
        }
      }
      
      // Update the role via direct update
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', user.id);
        
      if (updateError) {
        console.error('Profile update failed:', updateError);
        
        // Fall back to RPC
        const { data, error } = await supabase.rpc('handle_role_selection', {
          user_id: user.id,
          selected_role: role
      });
      
      if (error) {
          console.error('Error updating user role via RPC:', error);
          setError(error.message);
          return false;
        }
        
        console.log('Role updated via RPC:', data);
      } else {
        console.log('Role updated via direct update');
      }

      // Refresh session to get updated profile
      await refreshSession();
      return true;
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role');
      return false;
    }
  };

  // Initialize authentication
  const initializeAuth = async () => {
    // Skip if already initializing to prevent duplicate calls
    if (initializeRef.current) return
    initializeRef.current = true
    
    try {
      console.log('Initializing auth...')
      setLoading(true)
      setError(null)
      
      // Directly get the session from Supabase
      const { data: { session: initialSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error initializing auth:', error)
        setError(error.message)
        setLoading(false)
        return
      }
      
      // If we have a session, fetch the user profile
      if (initialSession?.user) {
        console.log('Session found on initialization:', initialSession.user.id)
        
        // Set the session and user
        setSession(initialSession)
        setUser(initialSession.user)
        
        // Only fetch profile if we haven't already
        if (!profileFetchRef.current) {
          try {
            profileFetchRef.current = true
            // Fetch the user profile
            const profile = await fetchUserProfile(initialSession.user.id)
            
            if (profile) {
              console.log('Profile found during init:', profile)
              setUserProfile(profile)
            } else {
              console.warn('No profile found during init despite having user')
            }
          } catch (profileError) {
            console.error('Error fetching profile during init:', profileError)
          } finally {
            profileFetchRef.current = false
          }
        }
      } else {
        console.log('No session found during initialization')
      }
      
      // Set up the auth state change listener
      const unsubscribe = setupAuthListener()
      
      setIsInitialized(true)
      setLoading(false)
      
      // Return cleanup function
      return unsubscribe
      
    } catch (err) {
      console.error('Exception during auth initialization:', err)
      setError('Failed to initialize authentication')
      setLoading(false)
    } finally {
      initializeRef.current = false
    }
  }
  
  // Set up listener for auth state changes
  const setupAuthListener = () => {
    console.log('Setting up auth state change listener')
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change event:', event)
        
        // Skip unnecessary processing for TOKEN_REFRESHED events
        // to avoid excessive profile fetching
        if (event === 'TOKEN_REFRESHED' && user && userProfile) {
          // Just update the session object, but don't refetch everything
          if (currentSession) {
            setSession(currentSession)
          }
          return
        }
        
        if (currentSession) {
          // Set the session and user
          console.log('New session established for user:', currentSession.user.id)
          setSession(currentSession)
          setUser(currentSession.user)
          
          // Avoid fetching profile if we haven't changed users
          const userChanged = user?.id !== currentSession.user.id
          
          if (userChanged || !userProfile) {
            // Fetch the user profile
            const profile = await fetchUserProfile(currentSession.user.id)
            if (profile) {
              console.log('Profile updated after auth change:', profile)
              setUserProfile(profile)
              
              // For sign-in events, handle role-based redirects
              if (event === 'SIGNED_IN') {
                // If user doesn't have a role yet, redirect to role selection
                if (!profile.role) {
                  console.log('User has no role, redirecting to role selection')
                  router.push('/role-selector')
                }
              }
            }
          }
          
          // Only refresh page for important auth events
          if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED'].includes(event)) {
            // Use a gentle navigation update instead of a hard refresh
            setTimeout(() => router.refresh(), 300)
          }
        } else {
          // Clear the user data
          console.log('Session ended, clearing user data')
          setSession(null)
          setUser(null)
          setUserProfile(null)
        }
      }
    )
    
    // Return the unsubscribe function
    return () => {
      console.log('Cleaning up auth listener')
      subscription.unsubscribe()
    }
  }

  // Initialize authentication once
  useEffect(() => {
    if (isInitialized) return
    
    console.log('Running auth initialization effect')
    const initialize = async () => {
      const cleanup = await initializeAuth()
      return cleanup
    }
    
    const cleanupPromise = initialize()
    
    // Return cleanup function for useEffect
    return () => {
      // Handle promise-based cleanup function
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === 'function') {
          cleanup()
        }
      })
    }
  }, [isInitialized]) // Only run once when component mounts

  // Provide the context value
  const contextValue = {
    supabase,
    user,
    userProfile,
    session,
    loading,
    error,
    signOut,
    refreshSession,
    resetAuthState,
    signInWithGoogle,
    updateUserRole,
    isApplicant,
    isCompany
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
} 