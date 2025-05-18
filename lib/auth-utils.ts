/**
 * Utility functions for debugging and fixing authentication issues
 */

import { getBrowserClient } from './supabase-browser'

/**
 * Force sign out by clearing all Supabase and auth-related data
 * This is a more aggressive approach than the normal sign out
 * and can be used when normal sign out doesn't work
 */
export const forceSignOut = async () => {
  try {
    console.log('Executing force sign out')
    
    // Clear Supabase auth session in memory
    const supabase = getBrowserClient()
    await supabase.auth.signOut({ scope: 'global' })
    
    // Clear all auth-related cookies
    clearAuthCookies()
    
    // Clear local storage items related to Supabase
    Object.keys(localStorage)
      .filter(key => key.startsWith('sb-'))
      .forEach(key => localStorage.removeItem(key))
    
    console.log('Force sign out completed')
    
    // Reload the page to reset the application state
    window.location.href = '/'
  } catch (err) {
    console.error('Error during force sign out:', err)
  }
};

/**
 * Debug the current authentication state
 * Logs details about localStorage, sessionStorage, and cookies 
 * (hiding sensitive content)
 */
export const debugAuthState = async () => {
  try {
    const supabase = getBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    console.group('Auth Debugging')
    console.log('Session:', !!session)
    if (session) {
      // Safe logging of parts of auth data
      console.log('User ID:', session.user.id)
      console.log('User email:', session.user.email)
      console.log('Session expires:', session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'unknown')
      console.log('Access token (first 10 chars):', 
        session.access_token ? session.access_token.substring(0, 10) + '...' : 'None')
      console.log('Refresh token present:', !!session.refresh_token)
    }
    console.log('Auth cookies:')
    document.cookie.split(';')
      .filter(c => c.trim().startsWith('sb-'))
      .forEach(c => console.log('  ' + c.trim()))
    console.groupEnd()
  } catch (err) {
    console.error('Error debugging auth state:', err)
  }
};

// Simple emergency reset function using server-side endpoint
export const emergencyReset = () => {
  console.log('Performing emergency auth reset with server-side signout');
  
  if (typeof window === 'undefined') return false;
  
  try {
    // Force redirect to server-side signout endpoint
    window.location.href = '/api/auth/signout?redirectTo=/signin';
    return true;
  } catch (error) {
    console.error('Reset failed:', error);
    return false;
  }
};

// Clear all authentication cookies
export const clearAuthCookies = () => {
  // Find and clear all Supabase cookies
  document.cookie.split(';').forEach(c => {
    const cookieName = c.trim().split('=')[0]
    if (cookieName.startsWith('sb-')) {
      deleteCookie(cookieName)
    }
  })
  
  // Also clear auth flow cookie
  deleteCookie('auth_in_progress')
}

// Helper to delete a cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; SameSite=Lax;`
  // Also try without secure flag
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;`
  // Also try with domain
  const domain = window.location.hostname
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; SameSite=Lax;`
}

// Provide a reliable way to sign out via server endpoint
export const serverSignOut = () => {
  window.location.href = '/api/auth/signout'
}

/**
 * Helper to fix user profile issues
 * @param role Optional role to set during profile fix
 */
export async function fixUserProfile(role?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/fix-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: role ? JSON.stringify({ role }) : undefined,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Profile fix failed:', data);
      return false;
    }
    
    console.log('Profile fix result:', data);
    return true;
  } catch (error) {
    console.error('Error fixing user profile:', error);
    return false;
  }
}

// Make these available in browser console
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.debugAuth = debugAuthState;
  // @ts-ignore
  window.emergencyReset = emergencyReset;
} 