'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LuMenu, LuX } from 'react-icons/lu'
import { Sun, Moon } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { cn } from '@/lib/utils'

export default function SiteNavbar() {
  const pathname = usePathname()
  const { user, userProfile, signOut, isApplicant, isCompany } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the theme toggle
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get initial for avatar
  const getInitials = (name: string | undefined | null): string => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Main navigation links
  const navLinks = [
    { href: '/', label: 'Home' },
  ]

  // Add role-specific links
  if (isApplicant) {
    navLinks.push(
      { href: '/applicant/dashboard', label: 'Dashboard' },
      { href: '/jobs', label: 'Find Jobs' }
    )
  } else if (isCompany) {
    navLinks.push(
      { href: '/company/dashboard', label: 'Dashboard' },
      { href: '/company/jobs', label: 'Manage Jobs' }
    )
  }

  // Auth links for non-authenticated users
  const authLinks = !user ? [
    { href: '/signin', label: 'Sign In' },
  ] : []

  // Combine all navigation links
  const allLinks = [...navLinks, ...authLinks]

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl flex items-center">
            <span className="text-primary">findr</span>
            <span className="text-gray-400">.ai</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}

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

          {/* User Dropdown for authenticated users */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {userProfile?.avatar_url ? (
                      <AvatarImage src={userProfile.avatar_url} alt={userProfile.display_name || 'User'} />
                    ) : (
                      <AvatarFallback>{getInitials(userProfile?.display_name)}</AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userProfile?.display_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {isApplicant && (
                  <DropdownMenuItem asChild>
                    <Link href="/applicant/profile/edit">Edit Profile</Link>
                  </DropdownMenuItem>
                )}
                {isCompany && (
                  <DropdownMenuItem asChild>
                    <Link href="/company/profile/edit">Edit Profile</Link>
                  </DropdownMenuItem>
                )}
                {!userProfile?.role && (
                  <DropdownMenuItem asChild>
                    <Link href="/role-select">Select Role</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => signOut()}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Theme toggle for mobile */}
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
          
          {/* Menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <LuX className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </Container>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t p-4">
          <Container>
            <nav className="flex flex-col space-y-4">
              {allLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-8 w-8">
                      {userProfile?.avatar_url ? (
                        <AvatarImage src={userProfile.avatar_url} alt={userProfile.display_name || 'User'} />
                      ) : (
                        <AvatarFallback>{getInitials(userProfile?.display_name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-medium">{userProfile?.display_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
                    </div>
                  </div>
                  {isApplicant && (
                    <Link 
                      href="/applicant/profile/edit" 
                      className="text-sm font-medium transition-colors text-muted-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Edit Profile
                    </Link>
                  )}
                  {isCompany && (
                    <Link 
                      href="/company/profile/edit" 
                      className="text-sm font-medium transition-colors text-muted-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Edit Profile
                    </Link>
                  )}
                  {!userProfile?.role && (
                    <Link 
                      href="/role-select" 
                      className="text-sm font-medium transition-colors text-muted-foreground"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Select Role
                    </Link>
                  )}
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </nav>
          </Container>
        </div>
      )}
    </header>
  )
} 