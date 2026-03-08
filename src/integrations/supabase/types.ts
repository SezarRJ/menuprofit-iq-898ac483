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
      actions: {
        Row: {
          assignee: string
          created_at: string
          due_date: string | null
          id: string
          notes: string
          priority: string
          recommendation_id: string | null
          restaurant_id: string
          status: string
          title: string
          type: string
        }
        Insert: {
          assignee?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string
          priority?: string
          recommendation_id?: string | null
          restaurant_id: string
          status?: string
          title: string
          type?: string
        }
        Update: {
          assignee?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string
          priority?: string
          recommendation_id?: string | null
          restaurant_id?: string
          status?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_access_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          dataset: string
          filters_used: Json | null
          id: string
          reason: string | null
        }
        Insert: {
          action_type?: string
          admin_id: string
          created_at?: string
          dataset: string
          filters_used?: Json | null
          id?: string
          reason?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          dataset?: string
          filters_used?: Json | null
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          confidence: number
          created_at: string
          id: string
          impact: string
          reasoning: string
          restaurant_id: string
          status: string
          target_item: string | null
          title: string
          type: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          impact?: string
          reasoning?: string
          restaurant_id: string
          status?: string
          target_item?: string | null
          title: string
          type: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          impact?: string
          reasoning?: string
          restaurant_id?: string
          status?: string
          target_item?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          created_at: string
          id: string
          model: string | null
          restaurant_id: string
          tokens_used: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model?: string | null
          restaurant_id: string
          tokens_used?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string | null
          restaurant_id?: string
          tokens_used?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
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
      competitors: {
        Row: {
          created_at: string
          id: string
          location: string
          name: string
          notes: string
          restaurant_id: string
          tier: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string
          name: string
          notes?: string
          restaurant_id: string
          tier?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          name?: string
          notes?: string
          restaurant_id?: string
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          restaurant_id: string
          tier: string
          total_points: number
          total_spent: number
          visit_count: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          restaurant_id: string
          tier?: string
          total_points?: number
          total_spent?: number
          visit_count?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          restaurant_id?: string
          tier?: string
          total_points?: number
          total_spent?: number
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "customers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      fixed_costs: {
        Row: {
          category: string
          created_at: string
          id: string
          monthly_amount: number
          name: string
          restaurant_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          monthly_amount?: number
          name: string
          restaurant_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          monthly_amount?: number
          name?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fixed_costs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      hidden_costs: {
        Row: {
          category: string
          created_at: string
          id: string
          monthly_amount: number
          name: string
          per_recipe: boolean
          restaurant_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          monthly_amount?: number
          name: string
          per_recipe?: boolean
          restaurant_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          monthly_amount?: number
          name?: string
          per_recipe?: boolean
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hidden_costs_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_price_history: {
        Row: {
          created_at: string
          effective_date: string
          id: string
          ingredient_id: string
          price: number
          restaurant_id: string
          supplier_id: string | null
        }
        Insert: {
          created_at?: string
          effective_date?: string
          id?: string
          ingredient_id: string
          price?: number
          restaurant_id: string
          supplier_id?: string | null
        }
        Update: {
          created_at?: string
          effective_date?: string
          id?: string
          ingredient_id?: string
          price?: number
          restaurant_id?: string
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_price_history_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_price_history_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_price_history_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          alert_threshold: number
          created_at: string
          id: string
          name: string
          restaurant_id: string
          supplier_id: string | null
          unit: string
          unit_price: number
          waste_pct: number
          yield_pct: number
        }
        Insert: {
          alert_threshold?: number
          created_at?: string
          id?: string
          name: string
          restaurant_id: string
          supplier_id?: string | null
          unit?: string
          unit_price?: number
          waste_pct?: number
          yield_pct?: number
        }
        Update: {
          alert_threshold?: number
          created_at?: string
          id?: string
          name?: string
          restaurant_id?: string
          supplier_id?: string | null
          unit?: string
          unit_price?: number
          waste_pct?: number
          yield_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          created_at: string
          current_stock: number
          id: string
          ingredient_id: string
          last_restock_date: string | null
          max_stock_level: number
          min_stock_level: number
          restaurant_id: string
          unit: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          current_stock?: number
          id?: string
          ingredient_id: string
          last_restock_date?: string | null
          max_stock_level?: number
          min_stock_level?: number
          restaurant_id: string
          unit?: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          current_stock?: number
          id?: string
          ingredient_id?: string
          last_restock_date?: string | null
          max_stock_level?: number
          min_stock_level?: number
          restaurant_id?: string
          unit?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          id: string
          inventory_item_id: string
          notes: string
          quantity: number
          reason: string
          restaurant_id: string
          supplier_id: string | null
          total_cost: number
          transaction_date: string
          type: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_item_id: string
          notes?: string
          quantity?: number
          reason?: string
          restaurant_id: string
          supplier_id?: string | null
          total_cost?: number
          transaction_date?: string
          type?: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          inventory_item_id?: string
          notes?: string
          quantity?: number
          reason?: string
          restaurant_id?: string
          supplier_id?: string | null
          total_cost?: number
          transaction_date?: string
          type?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_profiles: {
        Row: {
          created_at: string
          energy_cost: number
          equipment_cost: number
          id: string
          labor_cost: number
          profile_type: string
          restaurant_id: string
        }
        Insert: {
          created_at?: string
          energy_cost?: number
          equipment_cost?: number
          id?: string
          labor_cost?: number
          profile_type?: string
          restaurant_id: string
        }
        Update: {
          created_at?: string
          energy_cost?: number
          equipment_cost?: number
          id?: string
          labor_cost?: number
          profile_type?: string
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_profiles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          id: string
          points: number
          restaurant_id: string
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          id?: string
          points?: number
          restaurant_id: string
          type?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          id?: string
          points?: number
          restaurant_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_restaurant_id_fkey"
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
      platform_admin_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_audit_logs: {
        Row: {
          action: string
          actor_user_id: string
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          reason: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_user_id: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          reason?: string
          target_id?: string | null
          target_type?: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          reason?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      platform_feature_flags: {
        Row: {
          created_at: string
          default_enabled: boolean
          description: string
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_enabled?: boolean
          description?: string
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_enabled?: boolean
          description?: string
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_notifications: {
        Row: {
          body: string
          channel: string
          created_at: string
          created_by: string
          id: string
          sent_count: number
          status: string
          target_city: string | null
          target_plan: string | null
          title: string
        }
        Insert: {
          body?: string
          channel?: string
          created_at?: string
          created_by: string
          id?: string
          sent_count?: number
          status?: string
          target_city?: string | null
          target_plan?: string | null
          title: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          created_by?: string
          id?: string
          sent_count?: number
          status?: string
          target_city?: string | null
          target_plan?: string | null
          title?: string
        }
        Relationships: []
      }
      pricing_suggestions: {
        Row: {
          attractive_price: number
          created_at: string
          explanation: Json | null
          id: string
          min_safe_price: number
          premium_price: number
          recipe_id: string
          recommended_price: number
          restaurant_id: string
          status: string
        }
        Insert: {
          attractive_price?: number
          created_at?: string
          explanation?: Json | null
          id?: string
          min_safe_price?: number
          premium_price?: number
          recipe_id: string
          recommended_price?: number
          restaurant_id: string
          status?: string
        }
        Update: {
          attractive_price?: number
          created_at?: string
          explanation?: Json | null
          id?: string
          min_safe_price?: number
          premium_price?: number
          recipe_id?: string
          recommended_price?: number
          restaurant_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_suggestions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_suggestions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          attractiveness: string | null
          created_at: string
          description: string | null
          end_date: string | null
          expected_margin: number
          id: string
          reason: string | null
          recipe_ids: string[] | null
          restaurant_id: string
          start_date: string | null
          status: string
          suggested_price: number
          timing: string | null
          title: string
          type: string
        }
        Insert: {
          attractiveness?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          expected_margin?: number
          id?: string
          reason?: string | null
          recipe_ids?: string[] | null
          restaurant_id: string
          start_date?: string | null
          status?: string
          suggested_price?: number
          timing?: string | null
          title: string
          type?: string
        }
        Update: {
          attractiveness?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          expected_margin?: number
          id?: string
          reason?: string | null
          recipe_ids?: string[] | null
          restaurant_id?: string
          start_date?: string | null
          status?: string
          suggested_price?: number
          timing?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_restaurant_id_fkey"
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
          is_protected: boolean
          kitchen_profile: string
          name: string
          packaging_channel: string
          restaurant_id: string
          selling_price: number
          target_margin_pct: number | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          is_protected?: boolean
          kitchen_profile?: string
          name: string
          packaging_channel?: string
          restaurant_id: string
          selling_price?: number
          target_margin_pct?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_protected?: boolean
          kitchen_profile?: string
          name?: string
          packaging_channel?: string
          restaurant_id?: string
          selling_price?: number
          target_margin_pct?: number | null
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
          baseline_plates: number
          city: string
          created_at: string
          default_currency: string
          default_kitchen_profile: string
          id: string
          min_margin_floor: number
          monthly_waste_budget: number
          name: string
          owner_id: string
          packaging_delivery: number
          packaging_dinein: number
          packaging_takeaway: number
          target_margin_pct: number
          updated_at: string
          washing_per_plate: number
        }
        Insert: {
          baseline_plates?: number
          city?: string
          created_at?: string
          default_currency?: string
          default_kitchen_profile?: string
          id?: string
          min_margin_floor?: number
          monthly_waste_budget?: number
          name: string
          owner_id: string
          packaging_delivery?: number
          packaging_dinein?: number
          packaging_takeaway?: number
          target_margin_pct?: number
          updated_at?: string
          washing_per_plate?: number
        }
        Update: {
          baseline_plates?: number
          city?: string
          created_at?: string
          default_currency?: string
          default_kitchen_profile?: string
          id?: string
          min_margin_floor?: number
          monthly_waste_budget?: number
          name?: string
          owner_id?: string
          packaging_delivery?: number
          packaging_dinein?: number
          packaging_takeaway?: number
          target_margin_pct?: number
          updated_at?: string
          washing_per_plate?: number
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
          channel: string | null
          created_at: string
          customer_email: string | null
          customer_phone: string | null
          dish_name: string
          id: string
          matched_recipe_id: string | null
          quantity: number
          sale_date: string | null
          sales_import_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
          dish_name?: string
          id?: string
          matched_recipe_id?: string | null
          quantity?: number
          sale_date?: string | null
          sales_import_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string
          customer_email?: string | null
          customer_phone?: string | null
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
      stripe_processed_events: {
        Row: {
          event_id: string
          event_type: string
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          processed_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          restaurant_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          restaurant_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          restaurant_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          created_at: string
          discount_pct: number
          id: string
          ingredient_id: string
          is_preferred: boolean
          last_purchase_date: string | null
          lead_time_days: number
          min_order_qty: number
          price: number
          quality_rating: number
          supplier_id: string
        }
        Insert: {
          created_at?: string
          discount_pct?: number
          id?: string
          ingredient_id: string
          is_preferred?: boolean
          last_purchase_date?: string | null
          lead_time_days?: number
          min_order_qty?: number
          price?: number
          quality_rating?: number
          supplier_id: string
        }
        Update: {
          created_at?: string
          discount_pct?: number
          id?: string
          ingredient_id?: string
          is_preferred?: boolean
          last_purchase_date?: string | null
          lead_time_days?: number
          min_order_qty?: number
          price?: number
          quality_rating?: number
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string
          availability_score: number
          contact_person: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          notes: string
          payment_terms: string
          phone: string
          price_score: number
          quality_score: number
          restaurant_id: string
        }
        Insert: {
          address?: string
          availability_score?: number
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          notes?: string
          payment_terms?: string
          phone?: string
          price_score?: number
          quality_score?: number
          restaurant_id: string
        }
        Update: {
          address?: string
          availability_score?: number
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          notes?: string
          payment_terms?: string
          phone?: string
          price_score?: number
          quality_score?: number
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_feature_flags: {
        Row: {
          created_at: string
          enabled: boolean
          flag_key: string
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          flag_key: string
          id?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          flag_key?: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_feature_flags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_limits: {
        Row: {
          ai_monthly_quota: number
          created_at: string
          id: string
          imports_limit: number
          ingredients_limit: number
          inventory_limit: number
          recipes_limit: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          ai_monthly_quota?: number
          created_at?: string
          id?: string
          imports_limit?: number
          ingredients_limit?: number
          inventory_limit?: number
          recipes_limit?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          ai_monthly_quota?: number
          created_at?: string
          id?: string
          imports_limit?: number
          ingredients_limit?: number
          inventory_limit?: number
          recipes_limit?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_limits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
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
      get_monthly_ai_tokens: {
        Args: { _restaurant_id: string }
        Returns: number
      }
      get_restaurant_plan: {
        Args: { _restaurant_id: string }
        Returns: Database["public"]["Enums"]["plan_tier"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
      is_recipe_owner: { Args: { _recipe_id: string }; Returns: boolean }
      is_restaurant_owner: {
        Args: { _restaurant_id: string }
        Returns: boolean
      }
      is_sales_import_owner: { Args: { _import_id: string }; Returns: boolean }
      is_supplier_owner: { Args: { _supplier_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "user"
        | "staff"
        | "admin"
        | "master_admin"
        | "billing_admin"
        | "support_agent"
        | "auditor"
      plan_tier: "free" | "pro" | "elite"
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
        "user",
        "staff",
        "admin",
        "master_admin",
        "billing_admin",
        "support_agent",
        "auditor",
      ],
      plan_tier: ["free", "pro", "elite"],
    },
  },
} as const
