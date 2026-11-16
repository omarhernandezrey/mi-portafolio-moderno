/**
 * Tipos generados desde la base de datos real de Supabase.
 *
 * NO SE EDITA A MANO. Se regenera cuando cambie el esquema:
 *   - con el conector de Supabase: generate_typescript_types
 *   - o con la CLI: supabase gen types typescript --project-id ozftxfwkhomnbvicjtae
 *
 * Regenerado el 2026-11-16 contra el proyecto `ozftxfwkhomnbvicjtae`,
 * ya con los 172 ítems de educación cargados (T-05c) y sin `match_projects`
 * (función rota del chatbot retirado, borrada en D-2).
 */

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
      admin_audit_logs: {
        Row: {
          action: string
          actor_email: string
          actor_id: string | null
          actor_role: string
          created_at: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_email: string
          actor_id?: string | null
          actor_role: string
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          actor_role?: string
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          http_status: number | null
          id: string
          latency_ms: number | null
          provider: string
          session_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          provider: string
          session_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          latency_ms?: number | null
          provider?: string
          session_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          consent_at: string | null
          created_at: string | null
          facts: Json | null
          human_takeover: boolean | null
          id: string
          intent: string | null
          language: string | null
          session_id: string
          summary: string | null
          updated_at: string | null
          variant: string | null
          visitor_email: string | null
          visitor_name: string | null
          visitor_phone: string | null
        }
        Insert: {
          consent_at?: string | null
          created_at?: string | null
          facts?: Json | null
          human_takeover?: boolean | null
          id?: string
          intent?: string | null
          language?: string | null
          session_id: string
          summary?: string | null
          updated_at?: string | null
          variant?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Update: {
          consent_at?: string | null
          created_at?: string | null
          facts?: Json | null
          human_takeover?: boolean | null
          id?: string
          intent?: string | null
          language?: string | null
          session_id?: string
          summary?: string | null
          updated_at?: string | null
          variant?: string | null
          visitor_email?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Relationships: []
      }
      feed_comments: {
        Row: {
          author_email: string
          author_name: string
          body: string
          created_at: string
          id: string
          ip_hash: string | null
          post_id: string
          status: string
        }
        Insert: {
          author_email: string
          author_name: string
          body: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          post_id: string
          status?: string
        }
        Update: {
          author_email?: string
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          post_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          created_at: string
          fingerprint: string
          id: string
          post_id: string
          reaction: string
        }
        Insert: {
          created_at?: string
          fingerprint: string
          id?: string
          post_id: string
          reaction?: string
        }
        Update: {
          created_at?: string
          fingerprint?: string
          id?: string
          post_id?: string
          reaction?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          author_email: string | null
          author_name: string
          author_role: string
          body: string
          category: string
          comments_count: number
          created_at: string
          id: string
          image_urls: string[]
          ip_hash: string | null
          lang: string
          likes_count: number
          link_url: string | null
          pinned: boolean
          reaction_counts: Json
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          author_email?: string | null
          author_name: string
          author_role?: string
          body: string
          category?: string
          comments_count?: number
          created_at?: string
          id?: string
          image_urls?: string[]
          ip_hash?: string | null
          lang: string
          likes_count?: number
          link_url?: string | null
          pinned?: boolean
          reaction_counts?: Json
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_email?: string | null
          author_name?: string
          author_role?: string
          body?: string
          category?: string
          comments_count?: number
          created_at?: string
          id?: string
          image_urls?: string[]
          ip_hash?: string | null
          lang?: string
          likes_count?: number
          link_url?: string | null
          pinned?: boolean
          reaction_counts?: Json
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          currency: string
          due_date: string
          id: string
          issue_date: string
          items: Json
          lead_id: string | null
          notes: string | null
          number: string
          pdf_url: string | null
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          due_date: string
          id?: string
          issue_date?: string
          items?: Json
          lead_id?: string | null
          notes?: string | null
          number: string
          pdf_url?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          due_date?: string
          id?: string
          issue_date?: string
          items?: Json
          lead_id?: string | null
          notes?: string | null
          number?: string
          pdf_url?: string | null
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          brief_data: Json | null
          budget: string | null
          company: string | null
          contract_signed_at: string | null
          contract_url: string | null
          conversation_id: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          name: string | null
          notes: string | null
          onboarding_step: number | null
          onboarding_token: string | null
          paid_at: string | null
          payment_id: string | null
          phone: string | null
          service_requested: string | null
          status: string | null
          timeline: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          brief_data?: Json | null
          budget?: string | null
          company?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          conversation_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string | null
          notes?: string | null
          onboarding_step?: number | null
          onboarding_token?: string | null
          paid_at?: string | null
          payment_id?: string | null
          phone?: string | null
          service_requested?: string | null
          status?: string | null
          timeline?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          brief_data?: Json | null
          budget?: string | null
          company?: string | null
          contract_signed_at?: string | null
          contract_url?: string | null
          conversation_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string | null
          notes?: string | null
          onboarding_step?: number | null
          onboarding_token?: string | null
          paid_at?: string | null
          payment_id?: string | null
          phone?: string | null
          service_requested?: string | null
          status?: string | null
          timeline?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_badges: {
        Row: {
          certificate: string | null
          certificate_url: string | null
          created_at: string
          id: string
          institution: Json | null
          is_new: boolean
          is_published: boolean
          logo: string | null
          position: number
          slug: string
          summary: Json | null
          title: Json
          updated_at: string
        }
        Insert: {
          certificate?: string | null
          certificate_url?: string | null
          created_at?: string
          id?: string
          institution?: Json | null
          is_new?: boolean
          is_published?: boolean
          logo?: string | null
          position?: number
          slug: string
          summary?: Json | null
          title: Json
          updated_at?: string
        }
        Update: {
          certificate?: string | null
          certificate_url?: string | null
          created_at?: string
          id?: string
          institution?: Json | null
          is_new?: boolean
          is_published?: boolean
          logo?: string | null
          position?: number
          slug?: string
          summary?: Json | null
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_education_categories: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          name: Json
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          name: Json
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          name?: Json
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_education_items: {
        Row: {
          category_id: string
          certificate: string | null
          certificate_url: string | null
          created_at: string
          description: Json | null
          duration: Json | null
          id: string
          institution: Json | null
          is_new: boolean
          is_published: boolean
          logo: string | null
          position: number
          slug: string
          title: Json
          updated_at: string
        }
        Insert: {
          category_id: string
          certificate?: string | null
          certificate_url?: string | null
          created_at?: string
          description?: Json | null
          duration?: Json | null
          id?: string
          institution?: Json | null
          is_new?: boolean
          is_published?: boolean
          logo?: string | null
          position?: number
          slug: string
          title: Json
          updated_at?: string
        }
        Update: {
          category_id?: string
          certificate?: string | null
          certificate_url?: string | null
          created_at?: string
          description?: Json | null
          duration?: Json | null
          id?: string
          institution?: Json | null
          is_new?: boolean
          is_published?: boolean
          logo?: string | null
          position?: number
          slug?: string
          title?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_education_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "portfolio_education_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_profile: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_published: boolean
          section: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_published?: boolean
          section: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          architecture: Json | null
          category: Json | null
          created_at: string
          demo: string
          demo_checked_at: string | null
          demo_embeddable: boolean
          description: Json
          features: Json | null
          highlights: Json | null
          id: string
          image_url: string | null
          is_published: boolean
          position: number
          repository: string
          slug: string
          technologies: string[]
          title: Json
          updated_at: string
        }
        Insert: {
          architecture?: Json | null
          category?: Json | null
          created_at?: string
          demo?: string
          demo_checked_at?: string | null
          demo_embeddable?: boolean
          description: Json
          features?: Json | null
          highlights?: Json | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          position?: number
          repository?: string
          slug: string
          technologies?: string[]
          title: Json
          updated_at?: string
        }
        Update: {
          architecture?: Json | null
          category?: Json | null
          created_at?: string
          demo?: string
          demo_checked_at?: string | null
          demo_embeddable?: boolean
          description?: Json
          features?: Json | null
          highlights?: Json | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          position?: number
          repository?: string
          slug?: string
          technologies?: string[]
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_services: {
        Row: {
          badge: string | null
          created_at: string
          description: Json | null
          features: Json | null
          gradient: string | null
          icon: string | null
          id: string
          is_published: boolean
          position: number
          price_currency: string | null
          price_max: number | null
          price_min: number | null
          slug: string
          title: Json
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          description?: Json | null
          features?: Json | null
          gradient?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          position?: number
          price_currency?: string | null
          price_max?: number | null
          price_min?: number | null
          slug: string
          title: Json
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          description?: Json | null
          features?: Json | null
          gradient?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          position?: number
          price_currency?: string | null
          price_max?: number | null
          price_min?: number | null
          slug?: string
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_skills: {
        Row: {
          category: Json | null
          color_hex: string | null
          created_at: string
          description: Json | null
          icon: string | null
          id: string
          is_published: boolean
          name: Json
          percentage: number
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          category?: Json | null
          color_hex?: string | null
          created_at?: string
          description?: Json | null
          icon?: string | null
          id?: string
          is_published?: boolean
          name: Json
          percentage?: number
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          category?: Json | null
          color_hex?: string | null
          created_at?: string
          description?: Json | null
          icon?: string | null
          id?: string
          is_published?: boolean
          name?: Json
          percentage?: number
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_technologies: {
        Row: {
          category: string | null
          color: string | null
          created_at: string
          icon_key: string | null
          id: string
          is_published: boolean
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string
          icon_key?: string | null
          id?: string
          is_published?: boolean
          name: string
          position?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string
          icon_key?: string | null
          id?: string
          is_published?: boolean
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_timeline: {
        Row: {
          created_at: string
          description: Json | null
          icon_key: string | null
          id: string
          is_published: boolean
          position: number
          slug: string
          title: Json
          updated_at: string
          year: Json
        }
        Insert: {
          created_at?: string
          description?: Json | null
          icon_key?: string | null
          id?: string
          is_published?: boolean
          position?: number
          slug: string
          title: Json
          updated_at?: string
          year: Json
        }
        Update: {
          created_at?: string
          description?: Json | null
          icon_key?: string | null
          id?: string
          is_published?: boolean
          position?: number
          slug?: string
          title?: Json
          updated_at?: string
          year?: Json
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          confirmation_token: string | null
          confirmed: boolean | null
          consent_at: string | null
          created_at: string | null
          email: string
          followup_sent_at: string | null
          id: string
          last_edition_slug: string | null
          source: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmation_token?: string | null
          confirmed?: boolean | null
          consent_at?: string | null
          created_at?: string | null
          email: string
          followup_sent_at?: string | null
          id?: string
          last_edition_slug?: string | null
          source: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmation_token?: string | null
          confirmed?: boolean | null
          consent_at?: string | null
          created_at?: string | null
          email?: string
          followup_sent_at?: string | null
          id?: string
          last_edition_slug?: string | null
          source?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          sender: string
          ticket_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          sender: string
          ticket_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          sender?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          lead_id: string | null
          project_id: string | null
          started_at: string
          stopped_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          lead_id?: string | null
          project_id?: string | null
          started_at?: string
          stopped_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          lead_id?: string | null
          project_id?: string | null
          started_at?: string
          stopped_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          attempt: number
          created_at: string | null
          error: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string | null
        }
        Insert: {
          attempt?: number
          created_at?: string | null
          error?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Update: {
          attempt?: number
          created_at?: string | null
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          active: boolean
          created_at: string | null
          events: string[]
          id: string
          secret: string
          updated_at: string | null
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          events?: string[]
          id?: string
          secret: string
          updated_at?: string | null
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          events?: string[]
          id?: string
          secret?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role: "owner" | "assistant" | "viewer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      user_role: ["owner", "assistant", "viewer"],
    },
  },
} as const
