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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      contact_inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          inquiry_type: string
          is_resolved: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          inquiry_type?: string
          is_resolved?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          is_resolved?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      dealer_visits: {
        Row: {
          created_at: string
          dealer_location: string | null
          dealer_name: string
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          officer_id: string
          order_amount: number | null
          order_placed: boolean
          purpose: string | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          created_at?: string
          dealer_location?: string | null
          dealer_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          officer_id: string
          order_amount?: number | null
          order_placed?: boolean
          purpose?: string | null
          updated_at?: string
          visit_date?: string
        }
        Update: {
          created_at?: string
          dealer_location?: string | null
          dealer_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          officer_id?: string
          order_amount?: number | null
          order_placed?: boolean
          purpose?: string | null
          updated_at?: string
          visit_date?: string
        }
        Relationships: []
      }
      farmer_meetings: {
        Row: {
          created_at: string
          crop: string | null
          farmer_name: string
          farmer_phone: string | null
          id: string
          latitude: number | null
          longitude: number | null
          meeting_date: string
          notes: string | null
          officer_id: string
          problem_reported: string | null
          product_recommended: string | null
          village: string | null
        }
        Insert: {
          created_at?: string
          crop?: string | null
          farmer_name: string
          farmer_phone?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meeting_date?: string
          notes?: string | null
          officer_id: string
          problem_reported?: string | null
          product_recommended?: string | null
          village?: string | null
        }
        Update: {
          created_at?: string
          crop?: string | null
          farmer_name?: string
          farmer_phone?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          meeting_date?: string
          notes?: string | null
          officer_id?: string
          problem_reported?: string | null
          product_recommended?: string | null
          village?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          current_stock: number
          distributor_id: string
          id: string
          last_updated: string
          max_stock: number
          min_stock: number
          product_id: string
          unit: string
        }
        Insert: {
          current_stock?: number
          distributor_id: string
          id?: string
          last_updated?: string
          max_stock?: number
          min_stock?: number
          product_id: string
          unit?: string
        }
        Update: {
          current_stock?: number
          distributor_id?: string
          id?: string
          last_updated?: string
          max_stock?: number
          min_stock?: number
          product_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          created_at: string
          from_name: string
          id: string
          preview: string | null
          read: boolean
          subject: string
          type: Database["public"]["Enums"]["message_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          from_name: string
          id?: string
          preview?: string | null
          read?: boolean
          subject: string
          type?: Database["public"]["Enums"]["message_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          from_name?: string
          id?: string
          preview?: string | null
          read?: boolean
          subject?: string
          type?: Database["public"]["Enums"]["message_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
          unit: string
        }
        Insert: {
          id?: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
          unit: string
        }
        Update: {
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
          unit?: string
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
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_date: string | null
          id: string
          notes: string | null
          order_number: string
          status: Database["public"]["Enums"]["order_status"]
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          description: string | null
          dosage: string | null
          features: string[] | null
          formulation: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_new: boolean
          mode_of_action: string | null
          name: string
          pack_sizes: string[] | null
          popularity: number
          price: number | null
          safety_precautions: string[] | null
          short_description: string | null
          slug: string
          target_crops: string[] | null
          target_pests: string[] | null
          technical_name: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          dosage?: string | null
          features?: string[] | null
          formulation?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_new?: boolean
          mode_of_action?: string | null
          name: string
          pack_sizes?: string[] | null
          popularity?: number
          price?: number | null
          safety_precautions?: string[] | null
          short_description?: string | null
          slug: string
          target_crops?: string[] | null
          target_pests?: string[] | null
          technical_name?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          dosage?: string | null
          features?: string[] | null
          formulation?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_new?: boolean
          mode_of_action?: string | null
          name?: string
          pack_sizes?: string[] | null
          popularity?: number
          price?: number | null
          safety_precautions?: string[] | null
          short_description?: string | null
          slug?: string
          target_crops?: string[] | null
          target_pests?: string[] | null
          technical_name?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gst_number: string | null
          id: string
          is_approved: boolean
          phone: string | null
          pincode: string | null
          state: string | null
          territory: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id?: string
          is_approved?: boolean
          phone?: string | null
          pincode?: string | null
          state?: string | null
          territory?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id?: string
          is_approved?: boolean
          phone?: string | null
          pincode?: string | null
          state?: string | null
          territory?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_targets: {
        Row: {
          achieved_amount: number
          created_at: string
          id: string
          month: number
          officer_id: string
          target_amount: number
          updated_at: string
          year: number
        }
        Insert: {
          achieved_amount?: number
          created_at?: string
          id?: string
          month: number
          officer_id: string
          target_amount?: number
          updated_at?: string
          year: number
        }
        Update: {
          achieved_amount?: number
          created_at?: string
          id?: string
          month?: number
          officer_id?: string
          target_amount?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_dealer_profiles: {
        Args: never
        Returns: {
          address: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gst_number: string | null
          id: string
          is_approved: boolean
          phone: string | null
          pincode: string | null
          state: string | null
          territory: string | null
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "distributor" | "dealer" | "farmer" | "field_officer"
      message_type: "support" | "announcement" | "order" | "general"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      product_category: "Insecticides" | "Fungicides" | "Herbicides" | "PGR"
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
      app_role: ["admin", "distributor", "dealer", "farmer", "field_officer"],
      message_type: ["support", "announcement", "order", "general"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      product_category: ["Insecticides", "Fungicides", "Herbicides", "PGR"],
    },
  },
} as const
