export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          awarded_at: string
          badge_type: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_type: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          company_name: string
          created_at: string
          email: string
          full_name: string
          goals: string | null
          id: string
          offer_details: string | null
          referral_source: string | null
          stage: string | null
          status: string
          tool_description: string | null
          what_they_offer: string[] | null
          what_they_want: string[] | null
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          full_name: string
          goals?: string | null
          id?: string
          offer_details?: string | null
          referral_source?: string | null
          stage?: string | null
          status?: string
          tool_description?: string | null
          what_they_offer?: string[] | null
          what_they_want?: string[] | null
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          full_name?: string
          goals?: string | null
          id?: string
          offer_details?: string | null
          referral_source?: string | null
          stage?: string | null
          status?: string
          tool_description?: string | null
          what_they_offer?: string[] | null
          what_they_want?: string[] | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          budget_range: string | null
          created_at: string
          description: string | null
          id: string
          partner_id: string
          skills_needed: string[] | null
          status: string
          title: string
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          description?: string | null
          id?: string
          partner_id: string
          skills_needed?: string[] | null
          status?: string
          title: string
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          description?: string | null
          id?: string
          partner_id?: string
          skills_needed?: string[] | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: string
          skill: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skill: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skill?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          availability: boolean
          badge_level: string
          bio: string | null
          created_at: string
          id: string
          linkedin: string | null
          name: string
          photo_url: string | null
          reputation_score: number
          title: string
          user_id: string
        }
        Insert: {
          availability?: boolean
          badge_level?: string
          bio?: string | null
          created_at?: string
          id?: string
          linkedin?: string | null
          name: string
          photo_url?: string | null
          reputation_score?: number
          title: string
          user_id: string
        }
        Update: {
          availability?: boolean
          badge_level?: string
          bio?: string | null
          created_at?: string
          id?: string
          linkedin?: string | null
          name?: string
          photo_url?: string | null
          reputation_score?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      talents: {
        Row: {
          availability: string | null
          avatar_url: string | null
          community_code: string | null
          country: string
          created_at: string
          email: string
          engagement_type: string | null
          full_name: string
          github_url: string | null
          hourly_rate_range: string | null
          id: string
          linkedin_url: string | null
          looking_for: string[] | null
          portfolio_url: string | null
          primary_role: string | null
          projects: Json | null
          proudest_build: string | null
          referral_source: string | null
          seniority: string | null
          skills: string[] | null
          status: string
          timezone: string | null
          why_join: string | null
          willing_to_mentor: boolean | null
          work_preference: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          avatar_url?: string | null
          community_code?: string | null
          country: string
          created_at?: string
          email: string
          engagement_type?: string | null
          full_name: string
          github_url?: string | null
          hourly_rate_range?: string | null
          id?: string
          linkedin_url?: string | null
          looking_for?: string[] | null
          portfolio_url?: string | null
          primary_role?: string | null
          projects?: Json | null
          proudest_build?: string | null
          referral_source?: string | null
          seniority?: string | null
          skills?: string[] | null
          status?: string
          timezone?: string | null
          why_join?: string | null
          willing_to_mentor?: boolean | null
          work_preference?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          avatar_url?: string | null
          community_code?: string | null
          country?: string
          created_at?: string
          email?: string
          engagement_type?: string | null
          full_name?: string
          github_url?: string | null
          hourly_rate_range?: string | null
          id?: string
          linkedin_url?: string | null
          looking_for?: string[] | null
          portfolio_url?: string | null
          primary_role?: string | null
          projects?: Json | null
          proudest_build?: string | null
          referral_source?: string | null
          seniority?: string | null
          skills?: string[] | null
          status?: string
          timezone?: string | null
          why_join?: string | null
          willing_to_mentor?: boolean | null
          work_preference?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          status?: string
        }
        Relationships: []
      }
      ventures: {
        Row: {
          budget_range: string | null
          company_name: string | null
          created_at: string
          description: string | null
          email: string
          full_name: string
          id: string
          intent_group: string | null
          referral_source: string | null
          status: string
          sub_intents: string[] | null
          timeline: string | null
        }
        Insert: {
          budget_range?: string | null
          company_name?: string | null
          created_at?: string
          description?: string | null
          email: string
          full_name: string
          id?: string
          intent_group?: string | null
          referral_source?: string | null
          status?: string
          sub_intents?: string[] | null
          timeline?: string | null
        }
        Update: {
          budget_range?: string | null
          company_name?: string | null
          created_at?: string
          description?: string | null
          email?: string
          full_name?: string
          id?: string
          intent_group?: string | null
          referral_source?: string | null
          status?: string
          sub_intents?: string[] | null
          timeline?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_community_code: { Args: never; Returns: string }
      get_homepage_stats: { Args: never; Returns: Json }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_partner: { Args: { _user_id: string }; Returns: boolean }
      update_user_safe: {
        Args: { _email?: string; _user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
