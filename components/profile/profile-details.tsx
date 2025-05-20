'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { LuLoader, LuExternalLink, LuGithub, LuLinkedin, LuBriefcase, LuUser, LuGlobe } from 'react-icons/lu'
import { ApplicantProfile, CompanyProfile } from '@/lib/supabase-types'
import Link from 'next/link'

export default function ProfileDetails() {
  const { user, userProfile, loading, refreshSession } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!userProfile && !loading) {
      refreshSession()
    }
  }, [userProfile, loading, refreshSession])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshSession()
    setIsRefreshing(false)
  }

  // Get initials for avatar fallback
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading || isRefreshing) {
    return (
      <div className="flex justify-center items-center py-16">
        <LuLoader className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-muted-foreground">Loading profile data...</span>
      </div>
    )
  }

  if (!user || !userProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Available</CardTitle>
          <CardDescription>
            You need to be signed in to view your profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/signin">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Basic Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </div>
            <Avatar className="h-16 w-16">
              <AvatarImage src={userProfile.avatar_url || ''} alt={userProfile.display_name || 'User'} />
              <AvatarFallback className="text-lg">
                {getInitials(userProfile.display_name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Name</div>
              <div className="text-base">{userProfile.display_name || 'Not set'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
              <div className="text-base">{userProfile.email || 'Not set'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Role</div>
              <div className="text-base capitalize">
                <div className="inline-flex items-center">
                  {userProfile.role === 'applicant' ? (
                    <><LuUser className="mr-1 h-4 w-4" /> Applicant</>
                  ) : userProfile.role === 'company' ? (
                    <><LuBriefcase className="mr-1 h-4 w-4" /> Company</>
                  ) : (
                    'Not set'
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Account ID</div>
              <div className="text-xs text-muted-foreground truncate">{user.id}</div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Role-specific information */}
          {userProfile.role === 'applicant' && <ApplicantDetails profileData={userProfile.profile_data as ApplicantProfile} />}
          {userProfile.role === 'company' && <CompanyDetails profileData={userProfile.profile_data as CompanyProfile} />}
          
          {!userProfile.role && (
            <div className="bg-muted p-4 rounded-md text-center">
              <p className="text-muted-foreground mb-2">You haven't selected a role yet</p>
              <Button asChild size="sm">
                <Link href="/role-selector">Select a Role</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || isRefreshing}>
          {isRefreshing ? <LuLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
          Refresh Profile Data
        </Button>
      </div>
    </div>
  )
}

// Applicant-specific profile details
function ApplicantDetails({ profileData }: { profileData?: ApplicantProfile }) {
  if (!profileData) {
    return (
      <div className="bg-muted p-4 rounded-md text-center">
        <p className="text-muted-foreground">Your applicant profile data is incomplete</p>
        <Button asChild variant="link" className="mt-2 p-0 h-auto">
          <Link href="/applicant/profile/edit">Complete Your Profile</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bio */}
      {profileData.about && (
        <div className="mb-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">About</div>
          <p className="text-sm whitespace-pre-wrap">{profileData.about}</p>
        </div>
      )}

      {/* Skills */}
      {profileData.skills && profileData.skills.length > 0 && (
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Skills</div>
          <div className="flex flex-wrap gap-1.5">
            {profileData.skills.map((skill, i) => (
              <span key={i} className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {profileData.education && Array.isArray(profileData.education) && profileData.education.length > 0 && (
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Education</div>
          <div className="space-y-2">
            {profileData.education.map((edu: any, index: number) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{edu.school}</div>
                <div>{edu.degree} in {edu.field}</div>
                <div className="text-muted-foreground text-xs">
                  {edu.start_date} - {edu.end_date || 'Present'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {profileData.experience && Array.isArray(profileData.experience) && profileData.experience.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-muted-foreground mb-1">Experience</div>
          <div className="space-y-3">
            {profileData.experience.map((exp: any, index: number) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{exp.company}</div>
                <div>{exp.position}</div>
                <div className="text-muted-foreground text-xs">
                  {exp.start_date} - {exp.end_date || 'Present'}
                </div>
                {exp.description && (
                  <div className="mt-1 text-xs">{exp.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience Years */}
      {profileData.experience_years !== null && (
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Experience</div>
          <p className="text-sm">{profileData.experience_years} {profileData.experience_years === 1 ? 'year' : 'years'} of professional experience</p>
        </div>
      )}

      {/* Certifications */}
      {profileData.certifications && Array.isArray(profileData.certifications) && profileData.certifications.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-muted-foreground mb-1">Certifications</div>
          <div className="space-y-2">
            {profileData.certifications.map((cert: any, index: number) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{cert.name}</div>
                <div className="text-xs">Issued by {cert.issuer} • {cert.date}</div>
                {cert.description && (
                  <div className="mt-1 text-xs">{cert.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {profileData.projects && Array.isArray(profileData.projects) && profileData.projects.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-muted-foreground mb-1">Projects</div>
          <div className="space-y-3">
            {profileData.projects.map((project: any, index: number) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{project.name}</div>
                {project.description && (
                  <div className="mt-1 text-xs">{project.description}</div>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.map((tech: string, techIndex: number) => (
                      <span key={techIndex} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.url && (
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center mt-1"
                  >
                    View Project <LuExternalLink className="ml-1 h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="pt-2">
        <div className="text-sm font-medium text-muted-foreground mb-2">Links</div>
        <div className="flex flex-wrap gap-3">
          {profileData.github_url && (
            <Button variant="outline" size="sm" asChild className="h-8">
              <Link href={profileData.github_url} target="_blank" rel="noopener noreferrer">
                <LuGithub className="mr-1.5 h-4 w-4" />
                GitHub
              </Link>
            </Button>
          )}
          {profileData.linkedin_url && (
            <Button variant="outline" size="sm" asChild className="h-8">
              <Link href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer">
                <LuLinkedin className="mr-1.5 h-4 w-4" />
                LinkedIn
              </Link>
            </Button>
          )}
          {profileData.resume_url && (
            <Button variant="outline" size="sm" asChild className="h-8">
              <Link href={profileData.resume_url} target="_blank" rel="noopener noreferrer">
                <LuExternalLink className="mr-1.5 h-4 w-4" />
                Resume
              </Link>
            </Button>
          )}
          {!profileData.github_url && !profileData.linkedin_url && !profileData.resume_url && (
            <span className="text-sm text-muted-foreground">No links provided</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Company-specific profile details
function CompanyDetails({ profileData }: { profileData?: CompanyProfile }) {
  if (!profileData) {
    return (
      <div className="bg-muted p-4 rounded-md text-center">
        <p className="text-muted-foreground">Your company profile data is incomplete</p>
        <Button asChild variant="link" className="mt-2 p-0 h-auto">
          <Link href="/company/profile/edit">Complete Your Profile</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Company Name */}
      {profileData.company_name && (
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Company Name</div>
          <p className="text-base font-medium">{profileData.company_name}</p>
        </div>
      )}

      {/* Industry */}
      {profileData.industry && (
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Industry</div>
          <p className="text-sm">{profileData.industry}</p>
        </div>
      )}

      {/* Company Size */}
      {profileData.company_size && (
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Company Size</div>
          <p className="text-sm">{profileData.company_size}</p>
        </div>
      )}

      {/* Description */}
      {profileData.description && (
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
          <p className="text-sm whitespace-pre-wrap">{profileData.description}</p>
        </div>
      )}

      {/* Links */}
      <div className="pt-2">
        <div className="text-sm font-medium text-muted-foreground mb-2">Links</div>
        <div className="flex flex-wrap gap-3">
          {profileData.website_url && (
            <Button variant="outline" size="sm" asChild className="h-8">
              <Link href={profileData.website_url} target="_blank" rel="noopener noreferrer">
                <LuGlobe className="mr-1.5 h-4 w-4" />
                Website
              </Link>
            </Button>
          )}
          {profileData.linkedin_url && (
            <Button variant="outline" size="sm" asChild className="h-8">
              <Link href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer">
                <LuLinkedin className="mr-1.5 h-4 w-4" />
                LinkedIn
              </Link>
            </Button>
          )}
          {!profileData.website_url && !profileData.linkedin_url && (
            <span className="text-sm text-muted-foreground">No links provided</span>
          )}
        </div>
      </div>
    </div>
  )
} 