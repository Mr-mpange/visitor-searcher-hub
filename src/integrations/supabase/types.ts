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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          amenities: string[] | null
          available: boolean | null
          beds: number | null
          city: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location: string
          max_guests: number | null
          price_per_night: number
          provider_id: string
          rating: number | null
          reviews_count: number | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          available?: boolean | null
          beds?: number | null
          city: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location: string
          max_guests?: number | null
          price_per_night: number
          provider_id: string
          rating?: number | null
          reviews_count?: number | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          available?: boolean | null
          beds?: number | null
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string
          max_guests?: number | null
          price_per_night?: number
          provider_id?: string
          rating?: number | null
          reviews_count?: number | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          end_date: string | null
          guests: number | null
          id: string
          notes: string | null
          provider_id: string
          service_id: string
          service_type: Database["public"]["Enums"]["service_type"]
          start_date: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          end_date?: string | null
          guests?: number | null
          id?: string
          notes?: string | null
          provider_id: string
          service_id: string
          service_type: Database["public"]["Enums"]["service_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          end_date?: string | null
          guests?: number | null
          id?: string
          notes?: string | null
          provider_id?: string
          service_id?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_halls: {
        Row: {
          amenities: string[] | null
          available: boolean | null
          capacity: number | null
          city: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location: string
          price_per_day: number | null
          price_per_hour: number
          provider_id: string
          rating: number | null
          reviews_count: number | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          available?: boolean | null
          capacity?: number | null
          city: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location: string
          price_per_day?: number | null
          price_per_hour: number
          provider_id: string
          rating?: number | null
          reviews_count?: number | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          available?: boolean | null
          capacity?: number | null
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location?: string
          price_per_day?: number | null
          price_per_hour?: number
          provider_id?: string
          rating?: number | null
          reviews_count?: number | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_halls_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          service_id: string
          service_type: Database["public"]["Enums"]["service_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          service_type: Database["public"]["Enums"]["service_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          business_address: string | null
          business_description: string | null
          business_email: string | null
          business_name: string
          business_phone: string | null
          created_at: string
          id: string
          logo_url: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          business_address?: string | null
          business_description?: string | null
          business_email?: string | null
          business_name: string
          business_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          business_address?: string | null
          business_description?: string | null
          business_email?: string | null
          business_name?: string
          business_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          content: string | null
          created_at: string
          id: string
          rating: number
          response: string | null
          response_at: string | null
          service_id: string
          service_type: Database["public"]["Enums"]["service_type"]
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id: string
          content?: string | null
          created_at?: string
          id?: string
          rating: number
          response?: string | null
          response_at?: string | null
          service_id: string
          service_type: Database["public"]["Enums"]["service_type"]
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          content?: string | null
          created_at?: string
          id?: string
          rating?: number
          response?: string | null
          response_at?: string | null
          service_id?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          available: boolean | null
          city: string
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          images: string[] | null
          location: string
          price_per_day: number
          price_per_km: number | null
          provider_id: string
          rating: number | null
          reviews_count: number | null
          seats: number | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          city: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          location: string
          price_per_day: number
          price_per_km?: number | null
          provider_id: string
          rating?: number | null
          reviews_count?: number | null
          seats?: number | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          city?: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          images?: string[] | null
          location?: string
          price_per_day?: number
          price_per_km?: number | null
          provider_id?: string
          rating?: number | null
          reviews_count?: number | null
          seats?: number | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rides_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "provider" | "user"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      listing_status: "draft" | "pending_approval" | "approved" | "rejected"
      service_type: "accommodation" | "ride" | "event_hall"
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
      app_role: ["admin", "provider", "user"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      listing_status: ["draft", "pending_approval", "approved", "rejected"],
      service_type: ["accommodation", "ride", "event_hall"],
    },
  },
} as const
