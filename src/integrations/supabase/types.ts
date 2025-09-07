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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json
          event_id: string | null
          event_type: string
          id: string
          ip_address: unknown | null
          organization_id: string | null
          participant_id: string | null
          referer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_id?: string | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          participant_id?: string | null
          referer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_id?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          participant_id?: string | null
          referer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "daily_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "analytics_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          event_id: string | null
          id: string
          organization_id: string | null
          os: string | null
          page_views: number | null
          participant_id: string | null
          referrer_domain: string | null
          session_id: string
          started_at: string
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          event_id?: string | null
          id?: string
          organization_id?: string | null
          os?: string | null
          page_views?: number | null
          participant_id?: string | null
          referrer_domain?: string | null
          session_id: string
          started_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          event_id?: string | null
          id?: string
          organization_id?: string | null
          os?: string | null
          page_views?: number | null
          participant_id?: string | null
          referrer_domain?: string | null
          session_id?: string
          started_at?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "daily_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "analytics_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      cache_invalidations: {
        Row: {
          cache_key: string
          created_at: string
          id: string
          invalidation_reason: string | null
          organization_id: string | null
          triggered_by_action: string | null
          triggered_by_user: string | null
        }
        Insert: {
          cache_key: string
          created_at?: string
          id?: string
          invalidation_reason?: string | null
          organization_id?: string | null
          triggered_by_action?: string | null
          triggered_by_user?: string | null
        }
        Update: {
          cache_key?: string
          created_at?: string
          id?: string
          invalidation_reason?: string | null
          organization_id?: string | null
          triggered_by_action?: string | null
          triggered_by_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cache_invalidations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          event_id: string | null
          id: string
          max_uses: number | null
          updated_at: string
          used_count: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          event_id?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          used_count?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          event_id?: string | null
          id?: string
          max_uses?: number | null
          updated_at?: string
          used_count?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "daily_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "discount_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          active: boolean | null
          created_at: string
          html_content: string
          id: string
          name: string
          organization_id: string
          subject: string
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          html_content: string
          id?: string
          name: string
          organization_id: string
          subject: string
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          html_content?: string
          id?: string
          name?: string
          organization_id?: string
          subject?: string
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      event_analytics_summary: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          checkin_conversion_rate: number | null
          checkins: number | null
          created_at: string
          date: string
          desktop_sessions: number | null
          direct_traffic: number | null
          email_traffic: number | null
          event_id: string | null
          form_abandonment_rate: number | null
          id: string
          mobile_sessions: number | null
          organic_traffic: number | null
          organization_id: string | null
          page_views: number | null
          paid_traffic: number | null
          registration_completed: number | null
          registration_conversion_rate: number | null
          registration_started: number | null
          social_traffic: number | null
          tablet_sessions: number | null
          top_cities: Json | null
          top_countries: Json | null
          unique_visitors: number | null
          updated_at: string
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          checkin_conversion_rate?: number | null
          checkins?: number | null
          created_at?: string
          date: string
          desktop_sessions?: number | null
          direct_traffic?: number | null
          email_traffic?: number | null
          event_id?: string | null
          form_abandonment_rate?: number | null
          id?: string
          mobile_sessions?: number | null
          organic_traffic?: number | null
          organization_id?: string | null
          page_views?: number | null
          paid_traffic?: number | null
          registration_completed?: number | null
          registration_conversion_rate?: number | null
          registration_started?: number | null
          social_traffic?: number | null
          tablet_sessions?: number | null
          top_cities?: Json | null
          top_countries?: Json | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          checkin_conversion_rate?: number | null
          checkins?: number | null
          created_at?: string
          date?: string
          desktop_sessions?: number | null
          direct_traffic?: number | null
          email_traffic?: number | null
          event_id?: string | null
          form_abandonment_rate?: number | null
          id?: string
          mobile_sessions?: number | null
          organic_traffic?: number | null
          organization_id?: string | null
          page_views?: number | null
          paid_traffic?: number | null
          registration_completed?: number | null
          registration_conversion_rate?: number | null
          registration_started?: number | null
          social_traffic?: number | null
          tablet_sessions?: number | null
          top_cities?: Json | null
          top_countries?: Json | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_analytics_summary_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "daily_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_analytics_summary_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_analytics_summary_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_analytics_summary_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_analytics_summary_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          allow_reentry: boolean | null
          capacity: number | null
          created_at: string
          default_currency: string | null
          description: string | null
          end_date: string
          id: string
          lgpd_text: string | null
          location: string | null
          name: string
          organization_id: string
          payment_enabled: boolean | null
          qr_prefix: string | null
          registration_fields: Json | null
          start_date: string
          status: string | null
          stripe_account_id: string | null
          ticket_categories: Json | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          allow_reentry?: boolean | null
          capacity?: number | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          end_date: string
          id?: string
          lgpd_text?: string | null
          location?: string | null
          name: string
          organization_id: string
          payment_enabled?: boolean | null
          qr_prefix?: string | null
          registration_fields?: Json | null
          start_date: string
          status?: string | null
          stripe_account_id?: string | null
          ticket_categories?: Json | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          allow_reentry?: boolean | null
          capacity?: number | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          end_date?: string
          id?: string
          lgpd_text?: string | null
          location?: string | null
          name?: string
          organization_id?: string
          payment_enabled?: boolean | null
          qr_prefix?: string | null
          registration_fields?: Json | null
          start_date?: string
          status?: string | null
          stripe_account_id?: string | null
          ticket_categories?: Json | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          created_at: string
          data: Json | null
          event_id: string | null
          fees_amount: number
          id: string
          net_revenue: number
          organization_id: string
          period_end: string
          period_start: string
          refunded_amount: number
          report_type: string
          total_revenue: number
          total_transactions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          event_id?: string | null
          fees_amount?: number
          id?: string
          net_revenue?: number
          organization_id: string
          period_end: string
          period_start: string
          refunded_amount?: number
          report_type: string
          total_revenue?: number
          total_transactions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          event_id?: string | null
          fees_amount?: number
          id?: string
          net_revenue?: number
          organization_id?: string
          period_end?: string
          period_start?: string
          refunded_amount?: number
          report_type?: string
          total_revenue?: number
          total_transactions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "daily_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "financial_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string | null
          id: string
          message: string
          metadata: Json | null
          organization_id: string
          participant_id: string | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          message: string
          metadata?: Json | null
          organization_id: string
          participant_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          organization_id?: string
          participant_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          participant_data: Json | null
          pricing_tier_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          participant_data?: Json | null
          pricing_tier_id?: string | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          participant_data?: Json | null
          pricing_tier_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_pricing_tier_id_fkey"
            columns: ["pricing_tier_id"]
            isOneToOne: false
            referencedRelation: "pricing_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          discount_amount: number | null
          discount_code_id: string | null
          event_id: string | null
          id: string
          metadata: Json | null
          status: string
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          discount_amount?: number | null
          discount_code_id?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          discount_amount?: number | null
          discount_code_id?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "daily_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      participants: {
        Row: {
          checked_in_at: string | null
          checked_out_at: string | null
          document: string | null
          email: string
          event_id: string
          id: string
          lgpd_consent: boolean | null
          lgpd_consent_date: string | null
          name: string
          phone: string | null
          photo_url: string | null
          qr_code: string
          registered_at: string
          registration_data: Json | null
          status: string | null
          ticket_category: string | null
        }
        Insert: {
          checked_in_at?: string | null
          checked_out_at?: string | null
          document?: string | null
          email: string
          event_id: string
          id?: string
          lgpd_consent?: boolean | null
          lgpd_consent_date?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          qr_code: string
          registered_at?: string
          registration_data?: Json | null
          status?: string | null
          ticket_category?: string | null
        }
        Update: {
          checked_in_at?: string | null
          checked_out_at?: string | null
          document?: string | null
          email?: string
          event_id?: string
          id?: string
          lgpd_consent?: boolean | null
          lgpd_consent_date?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          qr_code?: string
          registered_at?: string
          registration_data?: Json | null
          status?: string | null
          ticket_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "daily_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          event_id: string | null
          id: string
          metadata: Json | null
          participant_id: string | null
          payment_method: string | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          event_id?: string | null
          id?: string
          metadata?: Json | null
          participant_id?: string | null
          payment_method?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          event_id?: string | null
          id?: string
          metadata?: Json | null
          participant_id?: string | null
          payment_method?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "daily_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          organization_id: string | null
          unit: string
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          organization_id?: string | null
          unit: string
          user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          organization_id?: string | null
          unit?: string
          user_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_tiers: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          description: string | null
          early_bird_end_date: string | null
          early_bird_price: number | null
          event_id: string | null
          id: string
          max_quantity: number | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          early_bird_end_date?: string | null
          early_bird_price?: number | null
          event_id?: string | null
          id?: string
          max_quantity?: number | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          early_bird_end_date?: string | null
          early_bird_price?: number | null
          event_id?: string | null
          id?: string
          max_quantity?: number | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "daily_event_stats"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "pricing_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_attempts: {
        Row: {
          attempt_count: number | null
          created_at: string | null
          event_id: string
          id: string
          ip_address: unknown
          window_start: string | null
        }
        Insert: {
          attempt_count?: number | null
          created_at?: string | null
          event_id: string
          id?: string
          ip_address: unknown
          window_start?: string | null
        }
        Update: {
          attempt_count?: number | null
          created_at?: string | null
          event_id?: string
          id?: string
          ip_address?: unknown
          window_start?: string | null
        }
        Relationships: []
      }
      registration_rate_limits: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          ip_address: unknown
          registration_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          ip_address: unknown
          registration_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          ip_address?: unknown
          registration_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          active: boolean | null
          auth_user_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          organization_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          auth_user_id?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          organization_id?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          auth_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          organization_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          active: boolean | null
          created_at: string
          event_id: string
          events: string[]
          id: string
          retry_count: number | null
          secret: string | null
          timeout_seconds: number | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          event_id: string
          events?: string[]
          id?: string
          retry_count?: number | null
          secret?: string | null
          timeout_seconds?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          event_id?: string
          events?: string[]
          id?: string
          retry_count?: number | null
          secret?: string | null
          timeout_seconds?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      daily_event_stats: {
        Row: {
          checkins: number | null
          date: string | null
          event_id: string | null
          organization_id: string | null
          registrations: number | null
          unique_participants: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_summary: {
        Row: {
          check_in_rate: number | null
          checked_in_count: number | null
          end_date: string | null
          id: string | null
          name: string | null
          organization_id: string | null
          organization_name: string | null
          start_date: string | null
          status: string | null
          total_participants: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      public_events: {
        Row: {
          allow_reentry: boolean | null
          capacity: number | null
          description: string | null
          end_date: string | null
          id: string | null
          lgpd_text: string | null
          location: string | null
          name: string | null
          qr_prefix: string | null
          registration_fields: Json | null
          start_date: string | null
          status: string | null
          ticket_categories: Json | null
        }
        Insert: {
          allow_reentry?: boolean | null
          capacity?: number | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          lgpd_text?: string | null
          location?: string | null
          name?: string | null
          qr_prefix?: string | null
          registration_fields?: Json | null
          start_date?: string | null
          status?: string | null
          ticket_categories?: Json | null
        }
        Update: {
          allow_reentry?: boolean | null
          capacity?: number | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          lgpd_text?: string | null
          location?: string | null
          name?: string | null
          qr_prefix?: string | null
          registration_fields?: Json | null
          start_date?: string | null
          status?: string | null
          ticket_categories?: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_event_analytics: {
        Args: { p_end_date?: string; p_event_id: string; p_start_date?: string }
        Returns: {
          change_percentage: number
          metric_name: string
          metric_value: number
          previous_value: number
        }[]
      }
      check_registration_rate_limit: {
        Args: {
          p_event_id: string
          p_ip_address: unknown
          p_max_registrations?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      get_event_stats_cached: {
        Args: { p_event_id: string }
        Returns: {
          check_in_rate: number
          checkins: number
          last_updated: string
          registrations: number
        }[]
      }
      get_user_organization: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_role: {
        Args: { required_role: string; user_id: string }
        Returns: boolean
      }
      log_performance_metric: {
        Args: {
          p_metadata?: Json
          p_metric_name: string
          p_metric_type: string
          p_organization_id?: string
          p_unit: string
          p_value: number
        }
        Returns: string
      }
      refresh_daily_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      register_participant: {
        Args: {
          p_document?: string
          p_email: string
          p_event_id: string
          p_lgpd_consent?: boolean
          p_name: string
          p_phone?: string
          p_photo_url?: string
          p_registration_data?: Json
          p_ticket_category?: string
        }
        Returns: string
      }
      search_participants: {
        Args: {
          p_event_id: string
          p_limit?: number
          p_offset?: number
          p_search_term?: string
          p_status?: string
        }
        Returns: {
          checked_in_at: string
          email: string
          id: string
          name: string
          registered_at: string
          status: string
          ticket_category: string
          total_count: number
        }[]
      }
      setup_user_profile: {
        Args: {
          org_id?: string
          user_email: string
          user_name: string
          user_role?: string
        }
        Returns: string
      }
      validate_participant_data: {
        Args: {
          p_document?: string
          p_email: string
          p_name: string
          p_phone?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "legal_admin" | "client_admin" | "client_operator"
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
      app_role: ["legal_admin", "client_admin", "client_operator"],
    },
  },
} as const
