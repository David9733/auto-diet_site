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
      billing_keys: {
        Row: {
          billing_key: string
          card_company: string | null
          card_number_masked: string | null
          card_type: string | null
          created_at: string
          customer_key: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_key: string
          card_company?: string | null
          card_number_masked?: string | null
          card_type?: string | null
          created_at?: string
          customer_key: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_key?: string
          card_company?: string | null
          card_number_masked?: string | null
          card_type?: string | null
          created_at?: string
          customer_key?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          created_at: string
          end_date: string
          id: string
          plan_data: Json
          settings_id: string | null
          start_date: string
          updated_at: string
          user_id: string | null
          week_number: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          plan_data: Json
          settings_id?: string | null
          start_date: string
          updated_at?: string
          user_id?: string | null
          week_number: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          plan_data?: Json
          settings_id?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: false
            referencedRelation: "store_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_data: {
        Row: {
          calories: number
          carbs: number
          created_at: string | null
          fat: number
          fda_food_code: string | null
          food_name: string
          id: string
          protein: number
          serving_size_g: number | null
          sodium: number
          updated_at: string | null
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          fda_food_code?: string | null
          food_name: string
          id?: string
          protein?: number
          serving_size_g?: number | null
          sodium?: number
          updated_at?: string | null
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          fda_food_code?: string | null
          food_name?: string
          id?: string
          protein?: number
          serving_size_g?: number | null
          sodium?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          merchant_order_id: string
          metadata: Json
          order_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          merchant_order_id: string
          metadata?: Json
          order_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          merchant_order_id?: string
          metadata?: Json
          order_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          approved_at: string | null
          canceled_at: string | null
          created_at: string
          id: string
          method: string | null
          order_id: string
          raw: Json
          requested_at: string | null
          status: string
          supplied_amount: number | null
          toss_payment_key: string | null
          toss_transaction_id: string | null
          updated_at: string
          user_id: string
          vat: number | null
        }
        Insert: {
          approved_at?: string | null
          canceled_at?: string | null
          created_at?: string
          id?: string
          method?: string | null
          order_id: string
          raw?: Json
          requested_at?: string | null
          status?: string
          supplied_amount?: number | null
          toss_payment_key?: string | null
          toss_transaction_id?: string | null
          updated_at?: string
          user_id: string
          vat?: number | null
        }
        Update: {
          approved_at?: string | null
          canceled_at?: string | null
          created_at?: string
          id?: string
          method?: string | null
          order_id?: string
          raw?: Json
          requested_at?: string | null
          status?: string
          supplied_amount?: number | null
          toss_payment_key?: string | null
          toss_transaction_id?: string | null
          updated_at?: string
          user_id?: string
          vat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "payment_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          budget_per_meal: number
          cost_ratio: number
          created_at: string
          days_per_week: number
          id: string
          meals_per_day: number
          serving_count: number
          side_dish_count: number
          snack_afternoon: boolean
          snack_evening: boolean
          snack_morning: boolean
          store_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          budget_per_meal?: number
          cost_ratio?: number
          created_at?: string
          days_per_week?: number
          id?: string
          meals_per_day?: number
          serving_count?: number
          side_dish_count?: number
          snack_afternoon?: boolean
          snack_evening?: boolean
          snack_morning?: boolean
          store_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          budget_per_meal?: number
          cost_ratio?: number
          created_at?: string
          days_per_week?: number
          id?: string
          meals_per_day?: number
          serving_count?: number
          side_dish_count?: number
          snack_afternoon?: boolean
          snack_evening?: boolean
          snack_morning?: boolean
          store_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_charges: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string
          id: string
          payment_id: string | null
          raw: Json
          requested_at: string | null
          scheduled_at: string | null
          status: string
          subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string
          id?: string
          payment_id?: string | null
          raw?: Json
          requested_at?: string | null
          scheduled_at?: string | null
          status?: string
          subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          id?: string
          payment_id?: string | null
          raw?: Json
          requested_at?: string | null
          scheduled_at?: string | null
          status?: string
          subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_charges_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_charges_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          billing_key_id: string
          canceled_at: string | null
          created_at: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          interval_count: number
          interval_unit: string
          metadata: Json
          next_billing_at: string | null
          plan_name: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_key_id: string
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval_count?: number
          interval_unit?: string
          metadata?: Json
          next_billing_at?: string | null
          plan_name: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_key_id?: string
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval_count?: number
          interval_unit?: string
          metadata?: Json
          next_billing_at?: string | null
          plan_name?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_billing_key_id_fkey"
            columns: ["billing_key_id"]
            isOneToOne: false
            referencedRelation: "billing_keys"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
