'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { LuLoader, LuSave, LuCheck, LuX } from 'react-icons/lu'

export default function ApplicantEditPage() {
  const router = useRouter()
  const { user, userProfile, loading, supabase, refreshSession } = useAuth()
  
  // Form state
  const [about, setAbout] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [education, setEducation] = useState('')
  const [experienceYears, setExperienceYears] = useState<number | null>(null)
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // URL validation
  const [githubUrlError, setGithubUrlError] = useState('')
  const [linkedinUrlError, setLinkedinUrlError] = useState('')
  const [resumeUrlError, setResumeUrlError] = useState('')
  
  // Load user data - use a simple approach to avoid hook issues
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        if (!user) return
        
        // Get applicant profile data
        const { data: applicantProfile } = await supabase
          .from('applicant_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (applicantProfile) {
          // Initialize form with profile data
          setAbout(applicantProfile.about || '')
          setSkills(applicantProfile.skills || [])
          setEducation(applicantProfile.education || '')
          setExperienceYears(
            applicantProfile.experience_years !== undefined 
              ? applicantProfile.experience_years 
              : null
          )
          setGithubUrl(applicantProfile.github_url || '')
          setLinkedinUrl(applicantProfile.linkedin_url || '')
          setResumeUrl(applicantProfile.resume_url || '')
        }
      } catch (err) {
        console.error('Error loading applicant profile:', err)
      }
    }
    
    // Only load when user is available
    if (user) {
      loadProfileData()
    }
  }, [user, supabase])
  
  // Redirect non-applicant users
  useEffect(() => {
    if (!loading && userProfile?.role !== 'applicant') {
      router.push('/profile')
    }
  }, [loading, userProfile, router])
  
  // Basic URL validation function
  const validateUrl = (url: string): boolean => {
    if (!url) return true // Empty URLs are allowed
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }
  
  // Form validation and submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return
    
    // Validate URLs
    let hasErrors = false
    
    // Validate GitHub URL
    if (githubUrl) {
      if (!validateUrl(githubUrl)) {
        setGithubUrlError('Please enter a valid URL')
        hasErrors = true
      } else if (!githubUrl.includes('github.com')) {
        setGithubUrlError('URL should include github.com')
        hasErrors = true
      } else {
        setGithubUrlError('')
      }
    }
    
    // Validate LinkedIn URL
    if (linkedinUrl) {
      if (!validateUrl(linkedinUrl)) {
        setLinkedinUrlError('Please enter a valid URL')
        hasErrors = true
      } else if (!linkedinUrl.includes('linkedin.com')) {
        setLinkedinUrlError('URL should include linkedin.com')
        hasErrors = true
      } else {
        setLinkedinUrlError('')
      }
    }
    
    // Validate Resume URL
    if (resumeUrl && !validateUrl(resumeUrl)) {
      setResumeUrlError('Please enter a valid URL')
      hasErrors = true
    } else {
      setResumeUrlError('')
    }
    
    // Don't proceed if there are validation errors
    if (hasErrors) {
      setError('Please fix the errors in the form')
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)
      
      // Check if applicant profile exists
      const { data: existingProfile } = await supabase
        .from('applicant_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      const applicantData = {
        about,
        skills,
        education,
        experience_years: experienceYears,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        resume_url: resumeUrl,
        updated_at: new Date().toISOString()
      }
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('applicant_profiles')
          .update(applicantData)
          .eq('id', user.id)
        
        if (updateError) throw updateError
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('applicant_profiles')
          .insert({
            id: user.id,
            created_at: new Date().toISOString(),
            ...applicantData
          })
        
        if (insertError) throw insertError
      }
      
      // Update user_profiles to ensure role is set
      await supabase
        .from('user_profiles')
        .update({ role: 'applicant' })
        .eq('id', user.id)
      
      // Refresh session to update context
      await refreshSession()
      
      setSuccess('Profile updated successfully')
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle URL input changes with validation
  const handleGithubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setGithubUrl(url)
    
    if (url && !validateUrl(url)) {
      setGithubUrlError('Please enter a valid URL')
    } else if (url && !url.includes('github.com')) {
      setGithubUrlError('URL should include github.com')
    } else {
      setGithubUrlError('')
    }
  }
  
  const handleLinkedinUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setLinkedinUrl(url)
    
    if (url && !validateUrl(url)) {
      setLinkedinUrlError('Please enter a valid URL')
    } else if (url && !url.includes('linkedin.com')) {
      setLinkedinUrlError('URL should include linkedin.com')
    } else {
      setLinkedinUrlError('')
    }
  }
  
  const handleResumeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setResumeUrl(url)
    
    if (url && !validateUrl(url)) {
      setResumeUrlError('Please enter a valid URL')
    } else {
      setResumeUrlError('')
    }
  }
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }
  
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto pt-24 px-6 pb-12">
          <div className="flex justify-center items-center py-16">
            <LuLoader className="animate-spin h-8 w-8 text-primary" />
            <span className="ml-2 text-muted-foreground">Loading profile data...</span>
          </div>
        </main>
      </>
    )
  }
  
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto pt-24 px-6 pb-12">
          <Card>
            <CardHeader>
              <CardTitle>Profile Not Available</CardTitle>
              <CardDescription>
                You need to be signed in to edit your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => router.push('/signin')}>Sign In</Button>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto pt-24 px-6 pb-12">
        <h1 className="text-3xl font-bold mb-8">Edit Your Applicant Profile</h1>
        
        {(success || error) && (
          <div className={`p-4 rounded-md ${success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} flex items-start justify-between mb-6`}>
            <div className="flex items-center">
              {success ? (
                <LuCheck className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <LuX className="h-5 w-5 mr-2 text-red-500" />
              )}
              <p>{success || error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSuccess(null)
                setError(null)
              }}
              className="h-8 w-8 p-0 rounded-full"
            >
              <LuX className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Applicant Profile</CardTitle>
            <CardDescription>Update your professional details and experience</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  placeholder="A brief description of your professional background and interests"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                />
              </div>
              
              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    id="skills"
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddSkill}
                    className="shrink-0"
                  >
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skills.map((skill, index) => (
                      <div 
                        key={index} 
                        className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-primary/20"
                        >
                          <LuX className="h-3 w-3" />
                          <span className="sr-only">Remove {skill}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Education */}
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    placeholder="Highest degree or certification"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  />
                </div>
                
                {/* Experience Years */}
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Years of Experience</Label>
                  <Input
                    id="experienceYears"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Years of professional experience"
                    value={experienceYears === null ? '' : experienceYears}
                    onChange={(e) => setExperienceYears(
                      e.target.value === '' ? null : parseInt(e.target.value, 10)
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Professional Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium leading-6">Professional Links</h3>
                <p className="text-sm text-muted-foreground">Add your social and professional profiles to enhance your visibility to employers</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl" className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A66C2]">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect width="4" height="12" x="2" y="9"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                      LinkedIn Profile
                    </Label>
                    <Input
                      id="linkedinUrl"
                      placeholder="https://linkedin.com/in/yourusername"
                      value={linkedinUrl}
                      onChange={handleLinkedinUrlChange}
                      className={`bg-white/50 ${linkedinUrlError ? 'border-red-500' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add your LinkedIn profile to showcase your professional experience
                    </p>
                    {linkedinUrlError && (
                      <p className="text-xs text-red-500 mt-1">{linkedinUrlError}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl" className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#333]">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                        <path d="M9 18c-4.51 2-5-2-7-2"></path>
                      </svg>
                      GitHub Profile
                    </Label>
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/yourusername"
                      value={githubUrl}
                      onChange={handleGithubUrlChange}
                      className={`bg-white/50 ${githubUrlError ? 'border-red-500' : ''}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Showcase your code and projects to potential employers
                    </p>
                    {githubUrlError && (
                      <p className="text-xs text-red-500 mt-1">{githubUrlError}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <Label htmlFor="resumeUrl">Resume URL</Label>
                  <Input
                    id="resumeUrl"
                    placeholder="Link to your resume (PDF, Google Doc, etc.)"
                    value={resumeUrl}
                    onChange={handleResumeUrlChange}
                    className={resumeUrlError ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a link to your resume hosted on Google Drive, Dropbox, or similar services
                  </p>
                  {resumeUrlError && (
                    <p className="text-xs text-red-500 mt-1">{resumeUrlError}</p>
                  )}
                </div>
              </div>
              
              {/* Preview section */}
              <div className="w-full border rounded-lg p-4 bg-muted/20">
                <h4 className="text-sm font-medium mb-2">Profile Preview</h4>
                <p className="text-xs text-muted-foreground mb-3">This is how your profile will appear to recruiters</p>
                
                <div className="flex flex-wrap gap-3 mt-3">
                  {linkedinUrl && (
                    <a 
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs gap-1.5 px-3 py-1.5 bg-[#0A66C2]/10 text-[#0A66C2] rounded-full hover:bg-[#0A66C2]/20 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect width="4" height="12" x="2" y="9"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  
                  {githubUrl && (
                    <a 
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                        <path d="M9 18c-4.51 2-5-2-7-2"></path>
                      </svg>
                      GitHub
                    </a>
                  )}
                  
                  {resumeUrl && (
                    <a 
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" x2="8" y1="13" y2="13"></line>
                        <line x1="16" x2="8" y1="17" y2="17"></line>
                        <line x1="10" x2="8" y1="9" y2="9"></line>
                      </svg>
                      Resume
                    </a>
                  )}
                  
                  {!linkedinUrl && !githubUrl && !resumeUrl && (
                    <span className="text-xs text-muted-foreground italic">
                      Add professional links to see how they'll appear
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <LuSave className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </>
  )
} 