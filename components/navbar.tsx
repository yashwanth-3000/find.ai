"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LuMenu, LuX, LuLogOut, LuLoader, LuUser, LuBuilding } from 'react-icons/lu'
import { forceSignOut, debugAuthState, serverSignOut } from '@/lib/auth-utils'
import { Container } from '@/components/layout/container'

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname()
  const { user, userProfile, signOut, isApplicant, isCompany } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get initial for avatar
  const getInitials = (name: string | undefined | null): string => {
    if (!name || name === 'User') {
      // Get first letter of email if available, otherwise default to 'U'
      if (user?.email) {
        return user.email.substring(0, 1).toUpperCase();
      }
      return 'U';
    }
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Get display name in a consistent way
  const getDisplayName = (): string => {
    // First try to get from userProfile
    if (userProfile?.display_name && userProfile.display_name !== userProfile.id) {
      return userProfile.display_name;
    }
    
    // Fallback to user email (first part)
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    // Last resort
    return 'User';
  }
  
  // Handle sign out with fallback options
  const handleSignOut = (e: React.MouseEvent) => {
    // If shift key is pressed, show auth debug info
    if (e.shiftKey) {
      e.preventDefault();
      debugAuthState();
      return;
    }
    
    // If ctrl/cmd key is pressed, use force sign out
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      forceSignOut();
      return;
    }
    
    // Regular sign out - use the server endpoint
    setIsSubmitting(true);
    console.log("Starting sign out process using server endpoint");
    serverSignOut();
  };

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/" },
  ];

  // Add role-specific links
  if (isApplicant) {
    navLinks.push(
      { name: "Dashboard", path: "/applicant/dashboard" },
      { name: "Find Jobs", path: "/jobs" }
    )
  } else if (isCompany) {
    navLinks.push(
      { name: "Dashboard", path: "/company/dashboard" },
      { name: "Manage Jobs", path: "/company/jobs" }
    )
  }
  
  // Auth links for non-authenticated users
  const authLinks = !user ? [
    { name: "Sign In", path: "/signin" }
  ] : [];

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 border-b",
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-border/20 shadow-sm h-16"
          : "bg-background/30 backdrop-blur-sm border-transparent h-20"
      )}
    >
      <Container className="flex items-center justify-between h-full">
        {/* Logo and site name */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="flex items-center justify-center w-8 h-8 overflow-hidden rounded-lg bg-primary text-primary-foreground font-bold text-xl group-hover:opacity-80 transition-all duration-300">
            f
          </div>
          <span className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
            findr.ai
          </span>
        </Link>

        {/* Middle navigation links with subtle hover effect */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((item, index) => (
            <Link
              key={item.name} 
              href={item.path}
              className="group relative px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:transform group-hover:translate-y-[-2px] inline-block">
                {item.name}
              </span>
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-destructive to-destructive/70 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="relative h-9 w-9 rounded-full transition-colors duration-300 hover:bg-background hover:text-primary"
            >
              <span className="sr-only">Toggle theme</span>
              <div className="flex items-center justify-center w-full h-full">
                <Sun className={cn(
                  "absolute h-[1.3rem] w-[1.3rem] transition-all duration-300",
                  theme === "dark" 
                    ? "opacity-100 text-amber-200" 
                    : "opacity-0"
                )} />
                <Moon className={cn(
                  "absolute h-[1.3rem] w-[1.3rem] transition-all duration-300",
                  theme === "dark" 
                    ? "opacity-0" 
                    : "opacity-100 text-slate-900 dark:text-slate-400"
                )} />
              </div>
            </Button>
          )}
          
          {/* Auth items */}
          {!user ? (
            // Sign in button for non-authenticated users
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full" 
              onClick={() => {
                console.log("Sign in button clicked");
                window.location.href = "/signin";
              }}
            >
              Sign In
            </Button>
          ) : (
            // Avatar dropdown for authenticated users
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2">
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {userProfile?.avatar_url ? (
                      <AvatarImage src={userProfile.avatar_url} alt={userProfile.display_name || 'User'} />
                    ) : (
                        <AvatarFallback>
                          <LuUser className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
                  <span className="hidden md:inline font-medium max-w-[120px] truncate">{getDisplayName()}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-muted-foreground">{userProfile?.email || user?.email}</p>
                    {userProfile?.role && (
                      <p className="text-xs mt-1">
                        <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded capitalize">
                          {userProfile.role}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                                  <DropdownMenuSeparator />
                  {!userProfile?.role && (
                    <DropdownMenuItem asChild>
                      <Link href="/role-selector">Select Role</Link>
                    </DropdownMenuItem>
                  )}
                  {userProfile?.role === 'applicant' && (
                    <DropdownMenuItem asChild>
                      <Link href="/applicant/profile">View Profile</Link>
                    </DropdownMenuItem>
                  )}
                  {userProfile?.role === 'company' && (
                    <DropdownMenuItem asChild>
                      <Link href="/company/profile">View Profile</Link>
                    </DropdownMenuItem>
                  )}
                  {!userProfile?.role && (
                    <DropdownMenuItem asChild>
                      <Link href="/profile">View Profile</Link>
                    </DropdownMenuItem>
                  )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleSignOut}
                >
                  {isSubmitting ? (
                    <>
                      <LuLoader className="h-4 w-4 mr-2 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LuLogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden rounded-full w-9 h-9 hover:bg-muted/80"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <LuX className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
      </Container>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-md">
          <Container className="py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-sm font-medium px-2 py-1.5 rounded-md transition-colors hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {authLinks.map((item) => (
                <Button
                  key={item.name}
                  variant="outline"
                  size="sm"
                  className="text-sm font-medium px-4 py-2 text-primary rounded-md border border-border w-full"
                  onClick={() => {
                    console.log("Mobile sign in button clicked");
                    setIsMobileMenuOpen(false);
                    window.location.href = item.path;
                  }}
                >
                  {item.name}
                </Button>
              ))}
              {user && (
                <>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-8 w-8">
                      {userProfile?.avatar_url ? (
                        <AvatarImage src={userProfile.avatar_url} alt={userProfile.display_name || 'User'} />
                      ) : (
                        <AvatarFallback>
                          <LuUser className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium max-w-[120px] truncate">{getDisplayName()}</span>
                    <div className="flex flex-col ml-2">
                      <p className="text-xs text-muted-foreground">{userProfile?.email || user?.email}</p>
                      {userProfile?.role && (
                        <p className="text-xs mt-1">
                          <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded capitalize">
                            {userProfile.role}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                                      {!userProfile?.role && (
                      <Link 
                        href="/role-selector" 
                        className="text-sm font-medium px-2 py-1.5 rounded-md transition-colors hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Select Role
                      </Link>
                    )}
                    {userProfile?.role === 'applicant' && (
                      <Link 
                        href="/applicant/profile" 
                        className="text-sm font-medium px-2 py-1.5 rounded-md transition-colors hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        View Profile
                      </Link>
                    )}
                    {userProfile?.role === 'company' && (
                      <Link 
                        href="/company/profile" 
                        className="text-sm font-medium px-2 py-1.5 rounded-md transition-colors hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        View Profile
                      </Link>
                    )}
                    {!userProfile?.role && (
                      <Link 
                        href="/profile" 
                        className="text-sm font-medium px-2 py-1.5 rounded-md transition-colors hover:bg-muted"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        View Profile
                      </Link>
                    )}
                    <Button 
                      variant="destructive"  
                    onClick={handleSignOut}
                    className="w-full mt-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LuLoader className="h-4 w-4 mr-2 animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LuLogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </>
                    )}
                  </Button>
                </>
              )}
            </nav>
          </Container>
        </div>
      )}
    </nav>
  );
} 