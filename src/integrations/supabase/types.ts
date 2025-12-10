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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          organization_id: string | null
          title: string
          type: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          title: string
          type: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          created_at: string
          description: string | null
          dismissed: boolean | null
          id: string
          organization_id: string | null
          title: string
          type: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dismissed?: boolean | null
          id?: string
          organization_id?: string | null
          title: string
          type: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dismissed?: boolean | null
          id?: string
          organization_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          assessment_id: string
          created_at: string
          file_path: string | null
          id: string
          is_flagged: boolean | null
          question_id: string
          response_choice: Json | null
          response_text: string | null
          reviewer_notes: string | null
          score: number | null
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          file_path?: string | null
          id?: string
          is_flagged?: boolean | null
          question_id: string
          response_choice?: Json | null
          response_text?: string | null
          reviewer_notes?: string | null
          score?: number | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          file_path?: string | null
          id?: string
          is_flagged?: boolean | null
          question_id?: string
          response_choice?: Json | null
          response_text?: string | null
          reviewer_notes?: string | null
          score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          completed_date: string | null
          created_at: string
          due_date: string
          id: string
          organization_id: string | null
          progress: number | null
          score: number | null
          status: Database["public"]["Enums"]["assessment_status"] | null
          template_name: string
          updated_at: string
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          due_date: string
          id?: string
          organization_id?: string | null
          progress?: number | null
          score?: number | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
          template_name: string
          updated_at?: string
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          due_date?: string
          id?: string
          organization_id?: string | null
          progress?: number | null
          score?: number | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
          template_name?: string
          updated_at?: string
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          expiration_date: string | null
          file_path: string | null
          id: string
          name: string
          organization_id: string | null
          size: number | null
          status: Database["public"]["Enums"]["document_status"] | null
          type: Database["public"]["Enums"]["document_type"]
          upload_date: string
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          expiration_date?: string | null
          file_path?: string | null
          id?: string
          name: string
          organization_id?: string | null
          size?: number | null
          status?: Database["public"]["Enums"]["document_status"] | null
          type: Database["public"]["Enums"]["document_type"]
          upload_date?: string
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          expiration_date?: string | null
          file_path?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          size?: number | null
          status?: Database["public"]["Enums"]["document_status"] | null
          type?: Database["public"]["Enums"]["document_type"]
          upload_date?: string
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assessment_id: string | null
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          organization_id: string | null
          resolution_notes: string | null
          resolved_date: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          assessment_id?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          assessment_id?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      questionnaire_questions: {
        Row: {
          compliance_mapping: Json | null
          created_at: string
          id: string
          is_required: boolean | null
          options: Json | null
          order_index: number | null
          question_text: string
          question_type: string
          section: string
          template_id: string
          weight: number | null
        }
        Insert: {
          compliance_mapping?: Json | null
          created_at?: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number | null
          question_text: string
          question_type?: string
          section?: string
          template_id: string
          weight?: number | null
        }
        Update: {
          compliance_mapping?: Json | null
          created_at?: string
          id?: string
          is_required?: boolean | null
          options?: Json | null
          order_index?: number | null
          question_text?: string
          question_type?: string
          section?: string
          template_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          framework: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          completed: boolean | null
          created_at: string
          due_date: string
          id: string
          organization_id: string | null
          priority: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          assignee?: string | null
          completed?: boolean | null
          created_at?: string
          due_date: string
          id?: string
          organization_id?: string | null
          priority?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          assignee?: string | null
          completed?: boolean | null
          created_at?: string
          due_date?: string
          id?: string
          organization_id?: string | null
          priority?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_assessments: {
        Row: {
          access_token: string | null
          created_at: string
          due_date: string
          id: string
          is_recurring: boolean | null
          organization_id: string | null
          recurrence_interval: string | null
          reviewed_date: string | null
          risk_level: string | null
          score: number | null
          status: string
          submitted_date: string | null
          template_id: string | null
          title: string
          updated_at: string
          user_id: string | null
          vendor_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          due_date: string
          id?: string
          is_recurring?: boolean | null
          organization_id?: string | null
          recurrence_interval?: string | null
          reviewed_date?: string | null
          risk_level?: string | null
          score?: number | null
          status?: string
          submitted_date?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          vendor_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          due_date?: string
          id?: string
          is_recurring?: boolean | null
          organization_id?: string | null
          recurrence_interval?: string | null
          reviewed_date?: string | null
          risk_level?: string | null
          score?: number | null
          status?: string
          submitted_date?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_assessments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_assessments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          annual_value: number | null
          category: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          documents_count: number | null
          id: string
          last_assessment: string | null
          name: string
          next_assessment: string | null
          open_issues: number | null
          organization_id: string | null
          risk_score: number | null
          risk_tier: Database["public"]["Enums"]["risk_tier"] | null
          status: Database["public"]["Enums"]["vendor_status"] | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          annual_value?: number | null
          category: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          documents_count?: number | null
          id?: string
          last_assessment?: string | null
          name: string
          next_assessment?: string | null
          open_issues?: number | null
          organization_id?: string | null
          risk_score?: number | null
          risk_tier?: Database["public"]["Enums"]["risk_tier"] | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          annual_value?: number | null
          category?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          documents_count?: number | null
          id?: string
          last_assessment?: string | null
          name?: string
          next_assessment?: string | null
          open_issues?: number | null
          organization_id?: string | null
          risk_score?: number | null
          risk_tier?: Database["public"]["Enums"]["risk_tier"] | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_role: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["org_role"]
      }
      get_user_organization: { Args: { _user_id: string }; Returns: string }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      assessment_status: "not_started" | "in_progress" | "completed"
      document_status: "active" | "expired" | "expiring_soon"
      document_type: "soc2_report" | "iso_certificate" | "policy" | "contract"
      org_role: "owner" | "admin" | "member"
      risk_tier: "critical" | "high" | "medium" | "low"
      vendor_status: "active" | "pending" | "offboarded"
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
    Enums: {
      assessment_status: ["not_started", "in_progress", "completed"],
      document_status: ["active", "expired", "expiring_soon"],
      document_type: ["soc2_report", "iso_certificate", "policy", "contract"],
      org_role: ["owner", "admin", "member"],
      risk_tier: ["critical", "high", "medium", "low"],
      vendor_status: ["active", "pending", "offboarded"],
    },
  },
} as const
