import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string
          address: string
          created_at: string
          email_confirmed: boolean
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone: string
          address: string
          created_at?: string
          email_confirmed?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          address?: string
          created_at?: string
          email_confirmed?: boolean
        }
      }
      job_descriptions: {
        Row: {
          id: string
          user_id: string
          title: string
          company: string
          description: string
          requirements: string[]
          skills: string[]
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          company: string
          description: string
          requirements: string[]
          skills: string[]
          url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          company?: string
          description?: string
          requirements?: string[]
          skills?: string[]
          url?: string | null
          created_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          file_name: string
          content: string
          extracted_text: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          content: string
          extracted_text: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          content?: string
          extracted_text?: string
          created_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          resume_id: string
          job_id: string
          compatibility_score: number
          strengths: string[]
          weaknesses: string[]
          improvements: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id: string
          job_id: string
          compatibility_score: number
          strengths: string[]
          weaknesses: string[]
          improvements: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string
          job_id?: string
          compatibility_score?: number
          strengths?: string[]
          weaknesses?: string[]
          improvements?: string[]
          created_at?: string
        }
      }
      optimized_resumes: {
        Row: {
          id: string
          user_id: string
          original_resume_id: string
          job_id: string
          content: string
          improvements: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_resume_id: string
          job_id: string
          content: string
          improvements: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_resume_id?: string
          job_id?: string
          content?: string
          improvements?: string[]
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          phone: string
          address: string
          education: string
          experience: string
          skills: string[]
          certifications: string[]
          projects: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          phone: string
          address: string
          education?: string
          experience?: string
          skills?: string[]
          certifications?: string[]
          projects?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          phone?: string
          address?: string
          education?: string
          experience?: string
          skills?: string[]
          certifications?: string[]
          projects?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}