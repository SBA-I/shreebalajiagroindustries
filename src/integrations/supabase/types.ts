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
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          inquiry_type?: string
          is_resolved?: boolean
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          is_resolved?: boolean
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      dealer_invoices: {
        Row: {
          created_at: string
          dealer_id: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          pdf_url: string
          product_summary: string | null
          quantity_summary: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dealer_id: string
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          pdf_url: string
          product_summary?: string | null
          quantity_summary?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dealer_id?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          pdf_url?: string
          product_summary?: string | null
          quantity_summary?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_invoices_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_stock: {
        Row: {
          arriving_on: string | null
          created_at: string
          dealer_id: string
          id: string
          notes: string | null
          product_id: string
          status: string
          updated_at: string
        }
        Insert: {
          arriving_on?: string | null
          created_at?: string
          dealer_id: string
          id?: string
          notes?: string | null
          product_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          arriving_on?: string | null
          created_at?: string
          dealer_id?: string
          id?: string
          notes?: string | null
          product_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_stock_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      dealers: {
        Row: {
          address_line: string
          city: string
          contact_person: string | null
          created_at: string
          district: string | null
          email: string | null
          gst_number: string | null
          id: string
          is_active: boolean
          is_authorized: boolean
          lat: number | null
          license_number: string | null
          lng: number | null
          name: string
          phone: string
          photo_url: string | null
          pincode: string
          shop_url: string | null
          state: string
          taluka: string | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          address_line: string
          city: string
          contact_person?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          is_authorized?: boolean
          lat?: number | null
          license_number?: string | null
          lng?: number | null
          name: string
          phone: string
          photo_url?: string | null
          pincode: string
          shop_url?: string | null
          state: string
          taluka?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          address_line?: string
          city?: string
          contact_person?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean
          is_authorized?: boolean
          lat?: number | null
          license_number?: string | null
          lng?: number | null
          name?: string
          phone?: string
          photo_url?: string | null
          pincode?: string
          shop_url?: string | null
          state?: string
          taluka?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      disease_scans: {
        Row: {
          crop: string | null
          diagnosis: string
          id: string
          image_url: string | null
          recommendation: string | null
          scan_date: string
          severity: string | null
          user_id: string
        }
        Insert: {
          crop?: string | null
          diagnosis: string
          id?: string
          image_url?: string | null
          recommendation?: string | null
          scan_date?: string
          severity?: string | null
          user_id: string
        }
        Update: {
          crop?: string | null
          diagnosis?: string
          id?: string
          image_url?: string | null
          recommendation?: string | null
          scan_date?: string
          severity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dispatches: {
        Row: {
          carrier: string | null
          carrier_ref: string | null
          challan_url: string | null
          created_at: string
          dealer_id: string | null
          dealer_name: string
          delivered_at: string | null
          destination_city: string
          destination_state: string
          dispatched_at: string | null
          driver_name: string | null
          driver_phone: string | null
          expected_delivery_at: string | null
          id: string
          lr_number: string | null
          notes: string | null
          product_summary: string | null
          quantity_summary: string | null
          stage: string
          status: string
          tracking_number: string
          transport_company: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string | null
          carrier_ref?: string | null
          challan_url?: string | null
          created_at?: string
          dealer_id?: string | null
          dealer_name: string
          delivered_at?: string | null
          destination_city: string
          destination_state: string
          dispatched_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          expected_delivery_at?: string | null
          id?: string
          lr_number?: string | null
          notes?: string | null
          product_summary?: string | null
          quantity_summary?: string | null
          stage?: string
          status?: string
          tracking_number: string
          transport_company?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string | null
          carrier_ref?: string | null
          challan_url?: string | null
          created_at?: string
          dealer_id?: string | null
          dealer_name?: string
          delivered_at?: string | null
          destination_city?: string
          destination_state?: string
          dispatched_at?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          expected_delivery_at?: string | null
          id?: string
          lr_number?: string | null
          notes?: string | null
          product_summary?: string | null
          quantity_summary?: string | null
          stage?: string
          status?: string
          tracking_number?: string
          transport_company?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatches_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_crops: {
        Row: {
          area_acres: number | null
          created_at: string
          crop: string
          id: string
          sowing_date: string
          user_id: string
          variety: string | null
        }
        Insert: {
          area_acres?: number | null
          created_at?: string
          crop: string
          id?: string
          sowing_date: string
          user_id: string
          variety?: string | null
        }
        Update: {
          area_acres?: number | null
          created_at?: string
          crop?: string
          id?: string
          sowing_date?: string
          user_id?: string
          variety?: string | null
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
      marketing_assets: {
        Row: {
          asset_type: string
          audience: string
          created_at: string
          description: string | null
          file_url: string
          id: string
          is_active: boolean
          product_id: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          asset_type?: string
          audience?: string
          created_at?: string
          description?: string | null
          file_url: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          audience?: string
          created_at?: string
          description?: string | null
          file_url?: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_assets_product_id_fkey"
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
      msds_documents: {
        Row: {
          created_at: string
          file_size_kb: number | null
          file_url: string
          id: string
          is_active: boolean
          language: string
          product_id: string | null
          product_name: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          file_size_kb?: number | null
          file_url: string
          id?: string
          is_active?: boolean
          language?: string
          product_id?: string | null
          product_name: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          file_size_kb?: number | null
          file_url?: string
          id?: string
          is_active?: boolean
          language?: string
          product_id?: string | null
          product_name?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "msds_documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pest_calendar: {
        Row: {
          active_months: number[]
          created_at: string
          crop: string
          id: string
          is_active: boolean
          pest_name: string
          preventive_tips: string | null
          recommended_product_ids: string[] | null
          region: string
          season: string
          severity: string
          updated_at: string
        }
        Insert: {
          active_months: number[]
          created_at?: string
          crop: string
          id?: string
          is_active?: boolean
          pest_name: string
          preventive_tips?: string | null
          recommended_product_ids?: string[] | null
          region?: string
          season: string
          severity?: string
          updated_at?: string
        }
        Update: {
          active_months?: number[]
          created_at?: string
          crop?: string
          id?: string
          is_active?: boolean
          pest_name?: string
          preventive_tips?: string | null
          recommended_product_ids?: string[] | null
          region?: string
          season?: string
          severity?: string
          updated_at?: string
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
          pricing: Json
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
          pricing?: Json
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
          pricing?: Json
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
          assigned_territory: string | null
          created_at: string
          crops: string[] | null
          district: string | null
          employee_id: string | null
          full_name: string | null
          gst_document_url: string | null
          gst_number: string | null
          id: string
          land_size_acres: number | null
          license_document_url: string | null
          license_number: string | null
          phone: string | null
          preferred_language: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          shop_address: string | null
          shop_lat: number | null
          shop_lng: number | null
          shop_name: string | null
          state: string | null
          taluka: string | null
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_status: string
        }
        Insert: {
          assigned_territory?: string | null
          created_at?: string
          crops?: string[] | null
          district?: string | null
          employee_id?: string | null
          full_name?: string | null
          gst_document_url?: string | null
          gst_number?: string | null
          id?: string
          land_size_acres?: number | null
          license_document_url?: string | null
          license_number?: string | null
          phone?: string | null
          preferred_language?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          shop_address?: string | null
          shop_lat?: number | null
          shop_lng?: number | null
          shop_name?: string | null
          state?: string | null
          taluka?: string | null
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_status?: string
        }
        Update: {
          assigned_territory?: string | null
          created_at?: string
          crops?: string[] | null
          district?: string | null
          employee_id?: string | null
          full_name?: string | null
          gst_document_url?: string | null
          gst_number?: string | null
          id?: string
          land_size_acres?: number | null
          license_document_url?: string | null
          license_number?: string | null
          phone?: string | null
          preferred_language?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          shop_address?: string | null
          shop_lat?: number | null
          shop_lng?: number | null
          shop_name?: string | null
          state?: string | null
          taluka?: string | null
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_status?: string
        }
        Relationships: []
      }
      spray_logs: {
        Row: {
          created_at: string
          crop: string | null
          dosage: string | null
          id: string
          notes: string | null
          phi_days: number
          product_category: string | null
          product_name: string
          safe_harvest_date: string | null
          spray_date: string
          target_pest: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          crop?: string | null
          dosage?: string | null
          id?: string
          notes?: string | null
          phi_days?: number
          product_category?: string | null
          product_name: string
          safe_harvest_date?: string | null
          spray_date?: string
          target_pest?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          crop?: string | null
          dosage?: string | null
          id?: string
          notes?: string | null
          phi_days?: number
          product_category?: string | null
          product_name?: string
          safe_harvest_date?: string | null
          spray_date?: string
          target_pest?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sustainability_articles: {
        Row: {
          author: string | null
          author_role: string | null
          body: string
          category: string
          content: string[]
          created_at: string
          display_date: string | null
          excerpt: string | null
          featured: boolean
          hero_image_url: string | null
          id: string
          is_published: boolean
          published_at: string
          read_time: string | null
          slug: string
          sort_order: number
          tags: string[]
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          author_role?: string | null
          body: string
          category?: string
          content?: string[]
          created_at?: string
          display_date?: string | null
          excerpt?: string | null
          featured?: boolean
          hero_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string
          read_time?: string | null
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          author_role?: string | null
          body?: string
          category?: string
          content?: string[]
          created_at?: string
          display_date?: string | null
          excerpt?: string | null
          featured?: boolean
          hero_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string
          read_time?: string | null
          slug?: string
          sort_order?: number
          tags?: string[]
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      list_dealer_talukas_public: {
        Args: never
        Returns: {
          dealer_count: number
          district: string
          state: string
          taluka: string
        }[]
      }
      nearest_dealers_public: {
        Args: { _lat: number; _limit?: number; _lng: number }
        Returns: {
          address_line: string
          city: string
          distance_km: number
          district: string
          id: string
          is_authorized: boolean
          lat: number
          lng: number
          name: string
          photo_url: string
          pincode: string
          state: string
          taluka: string
          whatsapp: string
        }[]
      }
      search_dealers_public: {
        Args: { _pincode: string }
        Returns: {
          address_line: string
          city: string
          district: string
          id: string
          is_authorized: boolean
          lat: number
          lng: number
          name: string
          photo_url: string
          pincode: string
          state: string
          taluka: string
          whatsapp: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "farmer"
        | "distributor"
        | "field_officer"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "farmer",
        "distributor",
        "field_officer",
      ],
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
