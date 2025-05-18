"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Github, Linkedin, BriefcaseBusiness, Search } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Container } from "@/components/layout/container";

export function CustomHero() {
  const { user, userProfile, isApplicant, isCompany } = useAuth();

  // Generate role-specific CTA buttons
  const renderCtaButtons = () => {
    // Not logged in - show sign in button
    if (!user) {
      return (
        <div className="flex gap-4">
          <Button size="lg" variant="default" asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/signin">Get Started</Link>
          </Button>
        </div>
      );
    }
    
    // User hasn't selected a role yet
    if (!userProfile?.role) {
      return (
        <div className="flex gap-4">
          <Button size="lg" variant="default" asChild>
            <Link href="/role-selector">Select Role</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/profile">Complete Profile</Link>
          </Button>
        </div>
      );
    }
    
    // Applicant-specific CTAs
    if (isApplicant) {
      return (
        <div className="flex gap-4">
          <Button size="lg" variant="default" className="gap-2" asChild>
            <Link href="/jobs">
              <Search className="h-5 w-5" />
              Apply for Jobs
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <Link href="/applicant/dashboard">View Applications</Link>
          </Button>
        </div>
      );
    }
    
    // Company-specific CTAs
    if (isCompany) {
      return (
        <div className="flex gap-4">
          <Button size="lg" variant="default" className="gap-2" asChild>
            <Link href="/company/jobs/new">
              <BriefcaseBusiness className="h-5 w-5" />
              Post a Job
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <Link href="/company/dashboard">Manage Listings</Link>
          </Button>
        </div>
      );
    }
    
    // Fallback CTAs
    return (
      <div className="flex gap-4">
        <Button size="lg" variant="default" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/profile">Complete Profile</Link>
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full bg-background text-foreground">
      <Container>
        {/* Top Hero Section */}
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center lg:py-32">
          <h1 className="text-5xl font-bold tracking-tighter md:text-7xl">
            no more boring resumes. <span className="text-destructive">just apply.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            let your portfolio speak for itself. connect github and linkedin, then just click "apply" to any matching job.
          </p>
          {renderCtaButtons()}
        </div>

        {/* How it Works Section */}
        <div className="py-16 text-center">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold">link your profiles</h3>
              <p className="text-muted-foreground">
                connect your github and linkedin accounts instead of creating a traditional resume
              </p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="h-4 w-4" /> Connect GitHub
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Linkedin className="h-4 w-4" /> Connect LinkedIn
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold">get matched</h3>
              <p className="text-muted-foreground">
                our ai analyzes your public projects and work history to match you with relevant jobs
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold">one-click apply</h3>
              <p className="text-muted-foreground">
                no cover letters or application forms. just click "apply" and you're done!
              </p>
            </div>
          </div>
        </div>

        {/* Value Proposition Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight">no more resume drama</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              let your real work speak for itself. findr.ai eliminates the resume song and dance.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 text-card-foreground">
              <h3 className="text-2xl font-semibold">for applicants</h3>
              <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
                <li>apply to jobs without writing another cover letter</li>
                <li>import your portfolio directly from github</li>
                <li>pull work history from linkedin automatically</li>
                <li>one-click apply to matching jobs</li>
                <li>no more tedious application forms</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-card p-6 text-card-foreground">
              <h3 className="text-2xl font-semibold">for companies</h3>
              <ul className="mt-4 list-disc list-inside space-y-2 text-muted-foreground">
                <li>see what candidates have actually built</li>
                <li>review real code and projects from github</li>
                <li>verify skills through actual work, not claims</li>
                <li>automated skill matching based on portfolio</li>
                <li>focus on talent, not resume-writing ability</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Why it Works Section */}
        <div className="py-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight">why it works</h2>
            <p className="mt-4 mb-12 text-lg text-muted-foreground">
              actions speak louder than resumes
            </p>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-center gap-2">
                    <h4 className="text-xl font-semibold">building in public</h4>
                    <p className="text-sm text-muted-foreground">trumps writing about yourself</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h4 className="text-xl font-semibold">verified experience</h4>
                    <p className="text-sm text-muted-foreground">public profiles provide it</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h4 className="text-xl font-semibold">reduced bias</h4>
                    <p className="text-sm text-muted-foreground">algorithmic matching helps</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <h4 className="text-xl font-semibold">higher conversion</h4>
                    <p className="text-sm text-muted-foreground">single-click applications</p>
                </div>
            </div>
        </div>

        {/* Final CTA Section */}
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center lg:py-32">
          <h2 className="text-4xl font-bold tracking-tight">ready to simplify your job search?</h2>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            no resumes. no cover letters. just connect your profiles and apply.
          </p>
          {renderCtaButtons()}
        </div>

        {/* Footer */}
        <footer className="border-t py-12 text-center text-sm text-muted-foreground">
            <div className="mb-4">
                <span className="text-2xl font-bold">f</span>
                <span className="text-xl font-semibold"> findr.ai</span>
            </div>
            <p>© 2025 findr.ai. all rights reserved.</p>
            <p>no resumes. no cover letters. just apply.</p>
        </footer>
      </Container>
    </div>
  );
} 