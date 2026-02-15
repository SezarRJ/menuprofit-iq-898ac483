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
      competitor_prices: {
        Row: {
          competitor_name: string
          created_at: string
          id: string
          note: string | null
          price: number
          recipe_id: string
        }
        Insert: {
          competitor_name: string
          created_at?: string
          id?: string
          note?: string | null
          price?: number
          recipe_id: string
        }
        Update: {
          competitor_name?: string
          created_at?: string
          id?: string
          note?: string | null
          price?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_prices_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string
          id: string
          name: string
          restaurant_id: string
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          restaurant_id: string
          unit?: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          restaurant_id?: string
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      mapping_profiles: {
        Row: {
          created_at: string
          date_column: string | null
          dish_column: string | null
          id: string
          profile_name: string
          quantity_column: string | null
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          date_column?: string | null
          dish_column?: string | null
          id?: string
          profile_name?: string
          quantity_column?: string | null
          restaurant_id: string
        }
        Update: {
          created_at?: string
          date_column?: string | null
          dish_column?: string | null
          id?: string
          profile_name?: string
          quantity_column?: string | null
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mapping_profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_costs: {
        Row: {
          cost_type: string
          created_at: string
          id: string
          monthly_amount: number
          name: string
          restaurant_id: string
        }
        Insert: {
          cost_type: string
          created_at?: string
          id?: string
          monthly_amount?: number
          name: string
          restaurant_id: string
        }
        Update: {
          cost_type?: string
          created_at?: string
          id?: string
          monthly_amount?: number
          name?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operating_costs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          id: string
          ingredient_id: string
          quantity: number
          recipe_id: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          quantity?: number
          recipe_id: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          quantity?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          restaurant_id: string
          selling_price: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          restaurant_id: string
          selling_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          restaurant_id?: string
          selling_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          city: string
          created_at: string
          default_currency: string
          id: string
          name: string
          owner_id: string
          target_margin_pct: number
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          default_currency?: string
          id?: string
          name: string
          owner_id: string
          target_margin_pct?: number
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          default_currency?: string
          id?: string
          name?: string
          owner_id?: string
          target_margin_pct?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales_imports: {
        Row: {
          file_name: string
          id: string
          restaurant_id: string
          uploaded_at: string
        }
        Insert: {
          file_name?: string
          id?: string
          restaurant_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          id?: string
          restaurant_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_imports_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_rows: {
        Row: {
          created_at: string
          dish_name: string
          id: string
          matched_recipe_id: string | null
          quantity: number
          sale_date: string | null
          sales_import_id: string
        }
        Insert: {
          created_at?: string
          dish_name?: string
          id?: string
          matched_recipe_id?: string | null
          quantity?: number
          sale_date?: string | null
          sales_import_id: string
        }
        Update: {
          created_at?: string
          dish_name?: string
          id?: string
          matched_recipe_id?: string | null
          quantity?: number
          sale_date?: string | null
          sales_import_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_rows_matched_recipe_id_fkey"
            columns: ["matched_recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_rows_sales_import_id_fkey"
            columns: ["sales_import_id"]
            isOneToOne: false
            referencedRelation: "sales_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      volume_discount_rules: {
        Row: {
          discount_pct: number
          id: string
          min_margin_pct: number
          min_weekly_volume: number
          restaurant_id: string
        }
        Insert: {
          discount_pct?: number
          id?: string
          min_margin_pct?: number
          min_weekly_volume?: number
          restaurant_id: string
        }
        Update: {
          discount_pct?: number
          id?: string
          min_margin_pct?: number
          min_weekly_volume?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volume_discount_rules_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_recipe_owner: { Args: { _recipe_id: string }; Returns: boolean }
      is_restaurant_owner: {
        Args: { _restaurant_id: string }
        Returns: boolean
      }
      is_sales_import_owner: { Args: { _import_id: string }; Returns: boolean }
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
