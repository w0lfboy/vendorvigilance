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
          title: string
          type: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          type: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          type?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
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
          title?: string
          type?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
          size?: number | null
          status?: Database["public"]["Enums"]["document_status"] | null
          type?: Database["public"]["Enums"]["document_type"]
          upload_date?: string
          user_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee: string | null
          completed: boolean | null
          created_at: string
          due_date: string
          id: string
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
          priority?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
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
          risk_score?: number | null
          risk_tier?: Database["public"]["Enums"]["risk_tier"] | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assessment_status: "not_started" | "in_progress" | "completed"
      document_status: "active" | "expired" | "expiring_soon"
      document_type: "soc2_report" | "iso_certificate" | "policy" | "contract"
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
      risk_tier: ["critical", "high", "medium", "low"],
      vendor_status: ["active", "pending", "offboarded"],
    },
  },
} as const
