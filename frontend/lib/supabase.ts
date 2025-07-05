import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed'
          priority: number
          category: string | null
          deadline: string | null
          estimated_duration: number | null
          complexity_score: number | null
          ai_enhanced_description: string | null
          user_id: string
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          priority?: number
          category?: string | null
          deadline?: string | null
          estimated_duration?: number | null
          complexity_score?: number | null
          ai_enhanced_description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          priority?: number
          category?: string | null
          deadline?: string | null
          estimated_duration?: number | null
          complexity_score?: number | null
          ai_enhanced_description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      context_entries: {
        Row: {
          id: string
          content: string
          type: 'email' | 'message' | 'note' | 'document'
          source: string | null
          metadata: Record<string, any>
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          type: 'email' | 'message' | 'note' | 'document'
          source?: string | null
          metadata?: Record<string, any>
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          type?: 'email' | 'message' | 'note' | 'document'
          source?: string | null
          metadata?: Record<string, any>
          user_id?: string
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          description: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          description?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          description?: string | null
          user_id?: string
          created_at?: string
        }
      }
      ai_suggestions: {
        Row: {
          id: string
          task_id: string | null
          suggestion_type: 'priority' | 'deadline' | 'category' | 'description'
          original_value: string | null
          suggested_value: string
          confidence_score: number | null
          reasoning: string | null
          applied: boolean
          created_at: string
        }
        Insert: {
          id?: string
          task_id?: string | null
          suggestion_type: 'priority' | 'deadline' | 'category' | 'description'
          original_value?: string | null
          suggested_value: string
          confidence_score?: number | null
          reasoning?: string | null
          applied?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string | null
          suggestion_type?: 'priority' | 'deadline' | 'category' | 'description'
          original_value?: string | null
          suggested_value?: string
          confidence_score?: number | null
          reasoning?: string | null
          applied?: boolean
          created_at?: string
        }
      }
    }
  }
}