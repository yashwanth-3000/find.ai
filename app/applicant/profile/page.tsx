'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Container } from '@/components/layout/container'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  LuLoader, 
  LuPenLine, 
  LuBriefcase, 
  LuCalendar, 
  LuBookOpen, 
  LuAward, 
  LuMapPin, 
  LuGithub, 
  LuLinkedin, 
  LuExternalLink, 
  LuUser,
  LuCode,
  LuGraduationCap,
  LuPlus,
  LuBadgeCheck,
  LuX,
  LuSave
} from 'react-icons/lu'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

// Experience component
function ExperienceItem({ experience }: { experience: any }) {
  return (
    <div className="mb-6 relative">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {experience.company_logo_url ? (
            <img 
              src={experience.company_logo_url} 
              alt={experience.company} 
              className="h-12 w-12 rounded-md object-contain border p-1"
            />
          ) : (
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <LuBriefcase className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-medium">{experience.title}</h4>
          <p className="text-sm text-muted-foreground">{experience.company}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <LuCalendar className="h-3 w-3" />
            {experience.duration || `${experience.start_date || ''} - ${experience.end_date || 'Present'}`}
          </p>
          {experience.description && (
            <p className="text-sm mt-2">{experience.description}</p>
          )}
          </div>
      </div>
    </div>
  )
}

// Education component
function EducationItem({ education }: { education: any }) {
  return (
    <div className="mb-6 relative">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {education.institute_logo_url ? (
          <img 
            src={education.institute_logo_url} 
            alt={education.title} 
              className="h-12 w-12 rounded-md object-contain border p-1"
          />
          ) : (
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <LuGraduationCap className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="flex-1">
        <h4 className="text-base font-medium">{education.title}</h4>
          <p className="text-sm text-muted-foreground">
            {education.degree} {education.field ? `in ${education.field}` : ''}
          </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <LuCalendar className="h-3 w-3" />
            {education.start_year || ''} - {education.end_year || 'Present'}
        </p>
        {education.description && (
          <p className="text-sm mt-2">{education.description}</p>
        )}
      </div>
    </div>
    </div>
  )
}

// Project component
function ProjectItem({ project }: { project: any }) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{project.title}</CardTitle>
      {(project.start_date || project.end_date) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
          <LuCalendar className="h-3 w-3" />
          {project.start_date && project.start_date}
          {project.start_date && project.end_date && ' - '}
          {project.end_date && project.end_date}
        </p>
      )}
      </CardHeader>
      <CardContent>
        <p className="text-sm">{project.description}</p>
        {project.url && (
          <a 
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm mt-2 flex items-center gap-1 text-primary hover:underline"
          >
            <LuExternalLink className="h-3 w-3" />
            View Project
          </a>
        )}
      </CardContent>
    </Card>
  )
}

// Certification component
function CertificationItem({ certification }: { certification: any }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <LuBadgeCheck className="h-5 w-5" />
        </div>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{certification.title}</h4>
        <p className="text-xs text-muted-foreground">{certification.subtitle}</p>
        <p className="text-xs text-muted-foreground mt-1">{certification.meta}</p>
        {certification.credential_url && (
          <a
            href={certification.credential_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs mt-1 flex items-center gap-1 text-primary hover:underline"
          >
            <LuExternalLink className="h-3 w-3" />
            See credential
          </a>
        )}
      </div>
    </div>
  )
}

// Skills section
function SkillsSection({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <Badge key={index} variant="secondary">{skill}</Badge>
      ))}
    </div>
  )
}

// LinkedIn URL prompt dialog
function LinkedInPromptDialog({ 
  open, 
  onOpenChange, 
  linkedinUrl, 
  setLinkedinUrl, 
  urlError,
  setUrlError,
  savingUrl,
  onSave,
  onSkip 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkedinUrl: string;
  setLinkedinUrl: (url: string) => void;
  urlError: string;
  setUrlError: (error: string) => void;
  savingUrl: boolean;
  onSave: () => void;
  onSkip: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Connect Your LinkedIn Profile</DialogTitle>
          <DialogDescription className="text-center">
            Add your LinkedIn profile to automatically import your experience, education, skills, and more.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <LuLinkedin className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin-url" className="text-center block">LinkedIn Profile URL</Label>
            <Input
              id="linkedin-url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedinUrl}
              onChange={(e) => {
                setLinkedinUrl(e.target.value);
                setUrlError('');
              }}
            />
            {urlError && <p className="text-sm text-red-500">{urlError}</p>}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            This will help us create a complete profile for you automatically. Your profile information will help match you with the right job opportunities.
          </p>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={onSkip} className="sm:flex-1">
            Skip for Now
          </Button>
          <Button type="button" onClick={onSave} disabled={savingUrl} className="sm:flex-1">
            {savingUrl ? (
              <>
                <LuLoader className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>Connect LinkedIn</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Removed Log Terminal Component - keeping code as reference
// function LogTerminal({ logs }: { logs: string[] }) {
//   if (logs.length === 0) return null;
//   
//   return (
//     <div className="fixed bottom-4 right-4 w-96 max-h-64 bg-black/90 text-green-400 rounded-lg shadow-lg overflow-hidden z-50">
//       <div className="flex items-center justify-between p-2 bg-black/80 border-b border-gray-700">
//         <div className="flex items-center gap-1.5">
//           <LuTerminal className="h-4 w-4" />
//           <span className="text-xs font-mono">Profile Loading Console</span>
//         </div>
//       </div>
//       <div className="p-2 overflow-y-auto max-h-52 font-mono text-xs">
//         {logs.map((log, i) => (
//           <div key={i} className="py-0.5">
//             <span className="opacity-60">[{new Date().toLocaleTimeString()}]</span> {log}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

export default function ApplicantProfilePage() {
  const router = useRouter()
  const { user, userProfile, loading, supabase } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [linkedinProfileData, setLinkedinProfileData] = useState<any>(null)
  const [fetchingLinkedIn, setFetchingLinkedIn] = useState(false)
  const [apiKey, setApiKey] = useState('fd1c528d-23db-4f4b-9dbc-53835c75e2b8') // Default API key
  
  // For LinkedIn URL prompt
  const [showLinkedInPrompt, setShowLinkedInPrompt] = useState(false)
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [savingUrl, setSavingUrl] = useState(false)
  const [urlError, setUrlError] = useState('')

  // Add a log entry - for development debugging only
  const addLog = (message: string) => {
    // We no longer show logs on UI but keep them in console for debugging
    console.log(`[Profile] ${message}`);
  };
  
  // In the default export function, add these new state variables
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState<any>({
    about: '',
    skills: [],
    education: null,
    experience: null,
    certifications: null,
    projects: null,
    experience_years: null,
    github_url: '',
    linkedin_url: '',
    resume_url: ''
  })
  const [newSkill, setNewSkill] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // Load profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return
      
    try {
        setLoadingProfile(true)
        addLog("Starting profile data fetch...")
      
        // Get applicant profile data
        const { data, error } = await supabase
          .from('applicant_profiles')
          .select('*, linkedin_profile_raw')
          .eq('id', user.id)
          .single()
      
        if (error) {
          addLog(`Error fetching profile: ${error.message}`)
          // If record doesn't exist, we might need to create one
          if (error.code === 'PGRST116') {
            addLog("No profile found, may need to create one")
            // Automatically show LinkedIn import prompt
            setShowLinkedInPrompt(true)
          }
        } else {
          addLog("Profile data fetched successfully")
          setProfile(data)
          
          // If we have LinkedIn raw data, use it
          if (data?.linkedin_profile_raw) {
            addLog("LinkedIn profile data found in database")
            setLinkedinProfileData(data.linkedin_profile_raw)
          } 
          // Check if LinkedIn URL is missing and show the prompt
          else if (!data?.linkedin_url) {
            addLog("No LinkedIn URL found, showing prompt")
            setShowLinkedInPrompt(true)
          } else {
            addLog("LinkedIn URL found, but no profile data")
            // If URL exists but no data, show a prompt to import
            toast({
              title: "Import LinkedIn Data",
              description: "You've added your LinkedIn URL but haven't imported your data yet. Import now to complete your profile.",
              action: (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchLinkedInData}
                  disabled={fetchingLinkedIn}
                >
                  {fetchingLinkedIn ? 'Importing...' : 'Import Now'}
                </Button>
              ),
              duration: 10000,
            })
          }
      }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        addLog(`Error loading profile data: ${errorMsg}`)
      } finally {
        addLog("Initial profile fetch complete")
        setLoadingProfile(false)
      }
    }
    
    if (user) {
      fetchProfileData()
    }
  }, [user, supabase])
  
  // Redirect non-applicant users
  useEffect(() => {
    if (!loading && userProfile?.role !== 'applicant') {
      router.push('/profile')
    }
  }, [loading, userProfile, router])
  
  // Save LinkedIn URL to profile
  const saveLinkedInUrl = async () => {
    if (!linkedinUrl) {
      setUrlError('Please enter your LinkedIn URL');
      addLog("No LinkedIn URL entered");
      return;
    }
    
    // Simple URL validation
    if (!linkedinUrl.includes('linkedin.com/in/')) {
      setUrlError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)');
      addLog("Invalid LinkedIn URL format");
      return;
    }
    
    setSavingUrl(true);
    setLoadingProfile(true); // Also set main loading state
    addLog(`Saving LinkedIn URL: ${linkedinUrl}`);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      addLog("Updating profile in Supabase...");
      const { error } = await supabase
        .from('applicant_profiles')
        .upsert({
          id: user.id,
          linkedin_url: linkedinUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (error) throw error;
      
      addLog("LinkedIn URL saved successfully");
      
      // Update the profile state with the new URL
      setProfile((prev: any) => ({
        ...prev,
        linkedin_url: linkedinUrl
      }));
      
      // Close the prompt
      setShowLinkedInPrompt(false);
      
      // Ask if user wants to fetch LinkedIn data now
      const shouldFetch = window.confirm("LinkedIn URL saved. Would you like to import your LinkedIn data now?");
      if (shouldFetch) {
        addLog("User chose to fetch LinkedIn data");
        fetchLinkedInData();
      } else {
        addLog("User skipped LinkedIn data import");
        setLoadingProfile(false);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Error saving LinkedIn URL: ${errorMsg}`);
      console.error('Error saving LinkedIn URL:', error);
      setUrlError('Failed to save your LinkedIn URL. Please try again.');
      setLoadingProfile(false);
    } finally {
      setSavingUrl(false);
    }
  };
  
  // Skip adding LinkedIn for now
  const skipLinkedIn = () => {
    addLog("User skipped adding LinkedIn URL");
    setShowLinkedInPrompt(false);
  };
  
  // Trigger LinkedIn API to fetch profile data
  const fetchLinkedInData = () => {
    if (!profile?.linkedin_url) {
      addLog("No LinkedIn URL found, showing prompt")
      setShowLinkedInPrompt(true);
      return;
    }
    
    setFetchingLinkedIn(true);
    setLoadingProfile(true); // Set loading state for entire operation
    addLog("Starting LinkedIn data import process...")
    
    // Mock data for demonstration - in a real app, this would call the LinkedIn API
    setTimeout(() => {
      addLog("LinkedIn API returned data")
      // Sample LinkedIn data
      const mockLinkedInData = {
        name: "Yashwanth Krishna Pavushetty",
        position: "Gen AI │ building text2story.",
        about: "As a Generative AI Developer, I specialize in crafting innovative solutions that streamline workflows and enhance user experiences. My technical expertise includes developing AI agents, integrating various AI APIs such as OpenAI, ElevenLabs, and Llama, and utilizing Large Language Models (LLMs) to build intelligent applications.",
        avatar: "https://media.licdn.com/dms/image/v2/D5603AQE_R1XowAlCLQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1722139379101?e=2147483647&v=beta&t=A-CmsvegAPWt0Hwwr9u_ImV1Rbb5RR-LMhP-BDxNJxo",
        banner_image: "https://media.licdn.com/dms/image/v2/D5616AQHTRKPoFCTtVg/profile-displaybackgroundimage-shrink_200_800/profile-displaybackgroundimage-shrink_200_800/0/1719645431211?e=2147483647&v=beta&t=20IjV5kfUf7StGVBip7jv2aLXGp2p4LbLsKxLEg71tw",
        location: "Hyderabad, Telangana, India",
        experience: [
          {
            title: "Public Relations Officer",
            company: "C-i2RE @ KITS Warangal",
            start_date: "Nov 2023",
            end_date: "Jun 2024",
            duration: "8 months",
            description: "Public Relations Officer and president of public relations and outreach club of student alliance body(SAIL)in a startup incubator called C-i2re. Managed Instagram page from zero, achieving 130K impressions and high engagement rates averaging 15k views per reel."
          }
        ],
        education: [
          {
            title: "buildspace",
            start_year: "2024",
            end_year: "2024",
            description: "Activities and Societies: working on a text-to-video app called text2story, transforming written prompts into engaging videos and generating stories based on user prompts.",
            institute_logo_url: "https://media.licdn.com/dms/image/v2/C4D0BAQH4v0G7qtO5UQ/company-logo_100_100/company-logo_100_100/0/1668195915807/buildspaceso_logo?e=2147483647&v=beta&t=NOVWRgLOtOxfYae8_ZIwHrIrrztH9GLVBNnpmEe8gcU"
          },
          {
            title: "Kakatiya Institute of Technology & Science",
            degree: "Bachelor of Technology - BTech",
            field: "Computer Science",
            start_year: "2022",
            end_year: "2026",
            institute_logo_url: "https://media.licdn.com/dms/image/v2/C510BAQHeBoXaJ-XqXQ/company-logo_100_100/company-logo_100_100/0/1630585835539/kakatiya_institute_of_technology__science_yerragattu_hillocks_bheemaram_hasanparthy_warangal_logo?e=2147483647&v=beta&t=uhcf1MAbVpPIZTXom5ZbsFsWm6vqyN2QQyUgtiwuox8"
          }
        ],
        projects: [
          {
            title: "Text 2 Story",
            start_date: "Jun 2024",
            description: "My journey started with Text2Story, a project that turns textbook lessons into fun, personalized AI-generated video stories to make learning more engaging for children."
          },
          {
            title: "Symphony of the Stars- Nasa space apps challenge (2024 People's Choice Winner)",
            start_date: "Aug 2024",
            end_date: "Sep 2024",
            description: "We created an AI-powered platform that brings the awe-inspiring discoveries of the James Webb Space Telescope (JWST) directly to users by transforming scientific data into captivating multimedia stories."
          }
        ],
        certifications: [
          {
            title: "Winner - IBM Granite Generative AI Hackathon",
            subtitle: "lablab.ai",
            meta: "Issued Feb 2025 Credential ID cm9sxh96k0030dl0sg4ys7u02",
            credential_url: "https://lablab.ai/u/@yashwanthkrishna/cm9sxh96k0030dl0sg4ys7u02"
          },
          {
            title: "2024 People's Choice Winner - NASA Space Apps Challenge",
            subtitle: "NASA - National Aeronautics and Space Administration",
            meta: "Issued Oct 2024",
            credential_url: "https://www.spaceappschallenge.org/nasa-space-apps-2024/find-a-team/teamone/?tab=details"
          }
        ],
        skills: ["Generative AI", "LLM", "React", "Next.js", "Node.js", "TypeScript", "Python", "API Integration"]
      };
      
      setLinkedinProfileData(mockLinkedInData);
      addLog("LinkedIn data received and set to state")
      
      // In a real app, store the data in Supabase
      if (user) {
        addLog("Saving LinkedIn data to Supabase...")
        supabase
          .from('applicant_profiles')
          .update({
            linkedin_profile_raw: mockLinkedInData
          })
          .eq('id', user.id)
          .then(() => {
            addLog("LinkedIn profile data stored successfully in database")
            setLoadingProfile(false); // Only set loading to false after storage completes
            setFetchingLinkedIn(false);
          })
          .then(undefined, (error: Error) => { // Fix for type error
            addLog(`Error storing profile: ${error.message}`)
            console.error('Error storing profile:', error);
            setLoadingProfile(false); // Make sure to set loading to false even on error
            setFetchingLinkedIn(false);
          });
      } else {
        addLog("No user found, can't save to database")
        setLoadingProfile(false); // Also handle case where user is not defined
        setFetchingLinkedIn(false);
    }
    }, 2000);
  };
  
  // After fetchProfileData function, add this function to handle entering edit mode
  const handleEditMode = () => {
    // Initialize the edit form with current data
    setEditData({
      about: displayData.about || '',
      skills: [...(displayData.skills || [])],
      education: displayData.education || null,
      experience: displayData.experience || null,
      certifications: displayData.certifications || null,
      projects: displayData.projects || null,
      experience_years: profile?.experience_years || null,
      github_url: profile?.github_url || '',
      linkedin_url: profile?.linkedin_url || '',
      resume_url: profile?.resume_url || ''
    })
    setIsEditMode(true)
  }
  
  const handleCancelEdit = () => {
    if (confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      setIsEditMode(false)
    }
  }
  
  const handleSaveProfile = async () => {
    setIsSaving(true)
    
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      // Validate data before saving
      let educationData = editData.education
      let experienceData = editData.experience
      let certificationsData = editData.certifications
      let projectsData = editData.projects
      
      // Convert string JSON input to actual JSON if needed
      if (typeof editData.education === 'string' && editData.education.trim()) {
        try {
          educationData = JSON.parse(editData.education)
        } catch (e) {
          throw new Error('Invalid JSON format for Education')
        }
      }
      
      if (typeof editData.experience === 'string' && editData.experience.trim()) {
        try {
          experienceData = JSON.parse(editData.experience)
        } catch (e) {
          throw new Error('Invalid JSON format for Experience')
        }
      }
      
      if (typeof editData.certifications === 'string' && editData.certifications.trim()) {
        try {
          certificationsData = JSON.parse(editData.certifications)
        } catch (e) {
          throw new Error('Invalid JSON format for Certifications')
        }
      }
      
      if (typeof editData.projects === 'string' && editData.projects.trim()) {
        try {
          projectsData = JSON.parse(editData.projects)
        } catch (e) {
          throw new Error('Invalid JSON format for Projects')
        }
      }
      
      // Prepare data for update
      const applicantData = {
        about: editData.about || null,
        skills: editData.skills || [],
        education: educationData,
        experience: experienceData,
        certifications: certificationsData,
        projects: projectsData,
        experience_years: editData.experience_years,
        github_url: editData.github_url || null,
        linkedin_url: editData.linkedin_url || null,
        resume_url: editData.resume_url || null,
        updated_at: new Date().toISOString()
      }
      
      // Check if profile exists and update or create
      const { data: existingProfile } = await supabase
        .from('applicant_profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('applicant_profiles')
          .update(applicantData)
          .eq('id', user.id)
        
        if (error) throw error
      } else {
        // Create new profile
        const { error } = await supabase
          .from('applicant_profiles')
          .insert({
            id: user.id,
            created_at: new Date().toISOString(),
            ...applicantData
          })
        
        if (error) throw error
      }
      
      // Fetch the updated profile data
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('applicant_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (fetchError) throw fetchError
      
      // Update local state
      setProfile(updatedProfile)
      
      // Exit edit mode
      setIsEditMode(false)
      
      // Show success message
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "success"
      })
      
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !editData.skills.includes(newSkill.trim())) {
      setEditData({
        ...editData,
        skills: [...editData.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setEditData({
      ...editData,
      skills: editData.skills.filter((skill: string) => skill !== skillToRemove)
    })
  }
  
  if (loading || loadingProfile) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="pt-24 flex justify-center">
            <div className="flex flex-col items-center">
              <LuLoader className="animate-spin h-8 w-8 text-primary" />
              <p className="mt-4 text-muted-foreground">
                {fetchingLinkedIn 
                  ? "Importing LinkedIn data and updating your profile..." 
                  : "Loading profile data... If it takes more than 3 seconds, please refresh the page."}
              </p>
            </div>
          </div>
        </Container>
      </>
    )
  }
  
  if (!user) {
    return (
      <>
        <Navbar />
        <Container>
          <div className="pt-24 pb-12">
            <Card>
              <CardHeader>
                <CardTitle>Profile Not Available</CardTitle>
                <CardDescription>
                  You need to be signed in to view your profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={() => router.push('/signin')}>Sign In</Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </>
    )
  }

  // For display - combine profile and LinkedIn data
  const displayData = {
    name: linkedinProfileData?.name || profile?.full_name || userProfile?.display_name || user.email?.split('@')[0],
    position: linkedinProfileData?.position || profile?.title || 'Software Developer',
    about: linkedinProfileData?.about || profile?.about || null,
    location: linkedinProfileData?.location || profile?.location || null,
    avatar: linkedinProfileData?.avatar || profile?.avatar_url || null,
    banner: linkedinProfileData?.banner_image || null,
    experience: linkedinProfileData?.experience || profile?.experience || [],
    education: linkedinProfileData?.education || profile?.education || [],
    projects: linkedinProfileData?.projects || profile?.projects || [],
    certifications: linkedinProfileData?.certifications || profile?.certifications || [],
    skills: linkedinProfileData?.skills || profile?.skills || []
  };

  return (
    <>
      <Navbar />
      
      {/* LinkedIn URL Prompt */}
      <LinkedInPromptDialog 
        open={showLinkedInPrompt}
        onOpenChange={setShowLinkedInPrompt}
        linkedinUrl={linkedinUrl}
        setLinkedinUrl={setLinkedinUrl}
        urlError={urlError}
        setUrlError={setUrlError}
        savingUrl={savingUrl}
        onSave={saveLinkedInUrl}
        onSkip={skipLinkedIn}
      />
      
      {loadingProfile ? (
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-primary/10 rounded-full">
              <LuLoader className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-medium mb-2">Loading profile...</h2>
            <p className="text-muted-foreground">Please wait while we fetch your information</p>
          </div>
        </div>
      ) : !profile || (!linkedinProfileData && !profile.about && !profile.skills?.length) ? (
        // Empty profile state
        <div className="pt-20 min-h-screen">
          <Container className="py-12">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <LuUser className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                <CardDescription>Your profile is incomplete. Connect your LinkedIn account to automatically import your professional information.</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p>A complete profile helps you get matched with the best job opportunities. Import your data from LinkedIn to get started quickly.</p>
              </CardContent>
              <CardFooter className="flex justify-center gap-3">
                <Button 
                  className="gap-2"
                  onClick={() => setShowLinkedInPrompt(true)}
                >
                  <LuLinkedin className="h-4 w-4" />
                  Connect LinkedIn
                </Button>
              </CardFooter>
            </Card>
          </Container>
        </div>
      ) : (
      <>
        {/* Banner and Profile Header */}
        <div className="w-full h-[200px] bg-gradient-to-r from-blue-600 to-indigo-800 relative">
          {displayData.banner && (
            <img 
              src={displayData.banner} 
              alt="Profile Banner"
                    className="w-full h-full object-cover"
                  />
          )}
          
          {/* Dark gradient overlay for banner */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
        
        <Container className="relative">
          {/* Profile Avatar - positioned to overlap banner */}
          <div className="absolute -top-16 left-8 md:left-12">
            <Avatar className="h-32 w-32 border-4 border-white shadow-md">
              {displayData.avatar ? (
                <AvatarImage src={displayData.avatar} alt={displayData.name} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-primary/10">
                  <LuUser className="h-12 w-12 text-primary" />
                </AvatarFallback>
              )}
            </Avatar>
                </div>
                
          {/* Main profile content */}
          <div className="pt-20 pb-12">
            {/* Profile header info */}
            <div className="mb-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{displayData.name}</h1>
                <p className="text-xl text-muted-foreground">{displayData.position}</p>
                
                {displayData.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                      <LuMapPin className="h-4 w-4" />
                    {displayData.location}
                  </p>
                )}
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile?.github_url && (
                    <a 
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <LuGithub className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  
                  {profile?.linkedin_url && (
                    <a 
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <LuLinkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  
                  {profile?.website_url && (
                    <a 
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <LuExternalLink className="h-4 w-4" />
                      Portfolio
                    </a>
                  )}
                </div>
                </div>
                
              <div className="flex flex-col gap-2">
                {!isEditMode ? (
                  <>
                    {/* Show Edit Profile button only if profile data exists */}
                    {(profile?.linkedin_profile_raw || profile?.about) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 whitespace-nowrap"
                        onClick={handleEditMode}
                      >
                        <LuPenLine className="h-4 w-4" /> 
                        Edit Profile
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 whitespace-nowrap"
                      onClick={handleCancelEdit}
                    >
                      <LuX className="h-4 w-4" /> 
                      Cancel
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="gap-1 whitespace-nowrap"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <><LuLoader className="h-4 w-4 animate-spin" /> Saving...</>
                      ) : (
                        <><LuSave className="h-4 w-4" /> Save Profile</>
                      )}
                    </Button>
                  </div>
                )}
                
                {!profile?.linkedin_url ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1 whitespace-nowrap"
                    onClick={() => setShowLinkedInPrompt(true)}
                  >
                    <LuLinkedin className="h-4 w-4" />
                    Connect LinkedIn
                  </Button>
                ) : !linkedinProfileData && (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1 whitespace-nowrap"
                    onClick={fetchLinkedInData}
                    disabled={fetchingLinkedIn}
                  >
                    {fetchingLinkedIn ? (
                      <LuLoader className="h-4 w-4 animate-spin" />
                    ) : (
                      <LuLinkedin className="h-4 w-4" />
                    )}
                    {fetchingLinkedIn ? 'Importing...' : 'Import LinkedIn Data'}
                  </Button>
                )}
              </div>
            </div>
            
            {/* About section */}
            {isEditMode ? (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editData.about || ''}
                    onChange={(e) => setEditData({...editData, about: e.target.value})}
                    placeholder="Tell us about yourself, your experience, and what you're looking for"
                    rows={6}
                    className="resize-none"
                  />
                </CardContent>
              </Card>
            ) : displayData.about ? (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{displayData.about}</p>
                </CardContent>
              </Card>
            ) : null}
            
            {/* Content sections in 2-column layout for larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main column - Experience, Education */}
              <div className="md:col-span-2 space-y-8">
                {/* Experience section */}
                {displayData.experience.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <LuBriefcase className="h-5 w-5" />
                        Experience
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {displayData.experience.map((exp: any, i: number) => (
                          <ExperienceItem key={i} experience={exp} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Education section */}
                {displayData.education.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <LuGraduationCap className="h-5 w-5" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {displayData.education.map((edu: any, i: number) => (
                          <EducationItem key={i} education={edu} />
                            ))}
                          </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Projects section */}
                {isEditMode ? (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <LuCode className="h-5 w-5" />
                        Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="projects">Enter your projects as JSON</Label>
                        <Textarea
                          id="projects"
                          placeholder={`[
  {
    "title": "Project Name",
    "description": "Project description goes here",
    "start_date": "Jan 2023",
    "end_date": "Present",
    "url": "https://project-url.com"
  }
]`}
                          value={typeof editData.projects === 'object' 
                            ? JSON.stringify(editData.projects, null, 2) 
                            : editData.projects || ''}
                          onChange={(e) => setEditData({...editData, projects: e.target.value})}
                          rows={10}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Add your projects as a JSON array with title, description, dates, and URL
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : displayData.projects.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <LuCode className="h-5 w-5" />
                        Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {displayData.projects.map((project: any, i: number) => (
                          <ProjectItem key={i} project={project} />
                      ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
                
              {/* Right sidebar - Skills, Certifications */}
              <div className="space-y-8">
                {/* Skills section */}
                {isEditMode ? (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <LuBriefcase className="h-5 w-5" />
                        Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
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
                        
                        <div className="flex flex-wrap gap-2">
                          {editData.skills.map((skill: string, index: number) => (
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
                      </div>
                    </CardContent>
                  </Card>
                ) : displayData.skills.length > 0 ? (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <LuBriefcase className="h-5 w-5" />
                        Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SkillsSection skills={displayData.skills} />
                    </CardContent>
                  </Card>
                ) : null}
                
                {/* Certifications section */}
                {displayData.certifications.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <LuAward className="h-5 w-5" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {displayData.certifications.map((cert: any, i: number) => (
                          <CertificationItem key={i} certification={cert} />
                          ))}
                        </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Placeholder for empty profile sections */}
                {!displayData.skills.length && !displayData.certifications.length && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Complete Your Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">Add more information to showcase your talents and experience.</p>
                      <Button asChild variant="outline" size="sm" className="gap-2">
                        <a href="/applicant/edit">
                          <LuPenLine className="h-4 w-4" />
                          Edit Profile
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </Container>
      </>
    )}
  </>
)
} 