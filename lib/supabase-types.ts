export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applicant_profiles: {
        Row: {
          id: string
          bio: string | null
          skills: string[] | null
          experience_years: number | null
          education: string | null
          linkedin_url: string | null
          github_url: string | null
          resume_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          bio?: string | null
          skills?: string[] | null
          experience_years?: number | null
          education?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bio?: string | null
          skills?: string[] | null
          experience_years?: number | null
          education?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      company_profiles: {
        Row: {
          id: string
          company_name: string | null
          industry: string | null
          company_size: string | null
          description: string | null
          website_url: string | null
          linkedin_url: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name?: string | null
          industry?: string | null
          company_size?: string | null
          description?: string | null
          website_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string | null
          industry?: string | null
          company_size?: string | null
          description?: string | null
          website_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          email: string | null
          avatar_url: string | null
          role: Database['public']['Enums']['user_role'] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role'] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role'] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_db_connection: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_user_profile: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      handle_role_selection: {
        Args: {
          user_id: string
          selected_role: Database['public']['Enums']['user_role']
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'applicant' | 'company'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Custom types for the application
export type UserRole = 'applicant' | 'company'

export interface UserProfile extends Tables<'user_profiles'> {
  profile_data?: ApplicantProfile | CompanyProfile
}

export interface ApplicantProfile extends Tables<'applicant_profiles'> {}
export interface CompanyProfile extends Tables<'company_profiles'> {} 