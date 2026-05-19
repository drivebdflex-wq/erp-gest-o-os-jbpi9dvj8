// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      audits: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          record_id: string
          table_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          record_id: string
          table_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string
          table_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audits_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      checklist_items: {
        Row: {
          checklist_id: string
          created_at: string | null
          field_type: string
          id: string
          is_required: boolean | null
          label: string
          updated_at: string | null
        }
        Insert: {
          checklist_id: string
          created_at?: string | null
          field_type: string
          id?: string
          is_required?: boolean | null
          label: string
          updated_at?: string | null
        }
        Update: {
          checklist_id?: string
          created_at?: string | null
          field_type?: string
          id?: string
          is_required?: boolean | null
          label?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'checklist_items_checklist_id_fkey'
            columns: ['checklist_id']
            isOneToOne: false
            referencedRelation: 'checklists'
            referencedColumns: ['id']
          },
        ]
      }
      checklist_responses: {
        Row: {
          checklist_item_id: string
          created_at: string | null
          id: string
          photo_url: string | null
          response_boolean: boolean | null
          response_number: number | null
          response_text: string | null
          service_order_checklist_id: string
          updated_at: string | null
        }
        Insert: {
          checklist_item_id: string
          created_at?: string | null
          id?: string
          photo_url?: string | null
          response_boolean?: boolean | null
          response_number?: number | null
          response_text?: string | null
          service_order_checklist_id: string
          updated_at?: string | null
        }
        Update: {
          checklist_item_id?: string
          created_at?: string | null
          id?: string
          photo_url?: string | null
          response_boolean?: boolean | null
          response_number?: number | null
          response_text?: string | null
          service_order_checklist_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'checklist_responses_checklist_item_id_fkey'
            columns: ['checklist_item_id']
            isOneToOne: false
            referencedRelation: 'checklist_items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'checklist_responses_service_order_checklist_id_fkey'
            columns: ['service_order_checklist_id']
            isOneToOne: false
            referencedRelation: 'service_order_checklists'
            referencedColumns: ['id']
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'checklists_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          document: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          document: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          document?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          client_id: string
          created_at: string | null
          end_date: string
          id: string
          start_date: string
          terms: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          end_date: string
          id?: string
          start_date: string
          terms?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          start_date?: string
          terms?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'contracts_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          material_id: string
          min_stock_level: number | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          material_id: string
          min_stock_level?: number | null
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          material_id?: string
          min_stock_level?: number | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_material_id_fkey'
            columns: ['material_id']
            isOneToOne: false
            referencedRelation: 'materials'
            referencedColumns: ['id']
          },
        ]
      }
      logs: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          level: string
          message: string
          updated_at: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          level: string
          message: string
          updated_at?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          level?: string
          message?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sku: string | null
          unit_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sku?: string | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sku?: string | null
          unit_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      photos: {
        Row: {
          created_at: string | null
          id: string
          service_order_id: string
          storage_url: string
          type: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          service_order_id: string
          storage_url: string
          type: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          service_order_id?: string
          storage_url?: string
          type?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'photos_service_order_id_fkey'
            columns: ['service_order_id']
            isOneToOne: false
            referencedRelation: 'service_orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'photos_uploaded_by_fkey'
            columns: ['uploaded_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_order_checklists: {
        Row: {
          checklist_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          service_order_id: string
          status: Database['public']['Enums']['checklist_status'] | null
          updated_at: string | null
        }
        Insert: {
          checklist_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          service_order_id: string
          status?: Database['public']['Enums']['checklist_status'] | null
          updated_at?: string | null
        }
        Update: {
          checklist_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          service_order_id?: string
          status?: Database['public']['Enums']['checklist_status'] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'service_order_checklists_checklist_id_fkey'
            columns: ['checklist_id']
            isOneToOne: false
            referencedRelation: 'checklists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_order_checklists_service_order_id_fkey'
            columns: ['service_order_id']
            isOneToOne: false
            referencedRelation: 'service_orders'
            referencedColumns: ['id']
          },
        ]
      }
      service_order_materials: {
        Row: {
          created_at: string | null
          id: string
          material_id: string
          quantity_used: number
          service_order_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id: string
          quantity_used: number
          service_order_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string
          quantity_used?: number
          service_order_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'service_order_materials_material_id_fkey'
            columns: ['material_id']
            isOneToOne: false
            referencedRelation: 'materials'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_order_materials_service_order_id_fkey'
            columns: ['service_order_id']
            isOneToOne: false
            referencedRelation: 'service_orders'
            referencedColumns: ['id']
          },
        ]
      }
      service_orders: {
        Row: {
          client_id: string
          created_at: string | null
          deadline_at: string | null
          deleted_at: string | null
          description: string | null
          finished_at: string | null
          id: string
          last_resumed_at: string | null
          latitude: number | null
          longitude: number | null
          paused_at: string | null
          priority: Database['public']['Enums']['service_order_priority']
          scheduled_at: string | null
          sla_status: Database['public']['Enums']['sla_status'] | null
          started_at: string | null
          status: Database['public']['Enums']['service_order_status']
          technician_id: string | null
          total_duration_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          deadline_at?: string | null
          deleted_at?: string | null
          description?: string | null
          finished_at?: string | null
          id?: string
          last_resumed_at?: string | null
          latitude?: number | null
          longitude?: number | null
          paused_at?: string | null
          priority?: Database['public']['Enums']['service_order_priority']
          scheduled_at?: string | null
          sla_status?: Database['public']['Enums']['sla_status'] | null
          started_at?: string | null
          status?: Database['public']['Enums']['service_order_status']
          technician_id?: string | null
          total_duration_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          deadline_at?: string | null
          deleted_at?: string | null
          description?: string | null
          finished_at?: string | null
          id?: string
          last_resumed_at?: string | null
          latitude?: number | null
          longitude?: number | null
          paused_at?: string | null
          priority?: Database['public']['Enums']['service_order_priority']
          scheduled_at?: string | null
          sla_status?: Database['public']['Enums']['sla_status'] | null
          started_at?: string | null
          status?: Database['public']['Enums']['service_order_status']
          technician_id?: string | null
          total_duration_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'service_orders_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_orders_technician_id_fkey'
            columns: ['technician_id']
            isOneToOne: false
            referencedRelation: 'technicians'
            referencedColumns: ['id']
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          id: string
          name: string
          supervisor_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          supervisor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'teams_supervisor_id_fkey'
            columns: ['supervisor_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      technicians: {
        Row: {
          availability_status: string | null
          created_at: string | null
          id: string
          specialty: string | null
          team_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability_status?: string | null
          created_at?: string | null
          id?: string
          specialty?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability_status?: string | null
          created_at?: string | null
          id?: string
          specialty?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'technicians_team_id_fkey'
            columns: ['team_id']
            isOneToOne: false
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'technicians_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          role_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          role_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          password_hash: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string | null
          created_at: string | null
          id: string
          model: string | null
          plate: string
          technician_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          id?: string
          model?: string | null
          plate: string
          technician_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          id?: string
          model?: string | null
          plate?: string
          technician_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'vehicles_technician_id_fkey'
            columns: ['technician_id']
            isOneToOne: false
            referencedRelation: 'technicians'
            referencedColumns: ['id']
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
      checklist_status: 'pending' | 'in_progress' | 'completed'
      service_order_priority: 'low' | 'medium' | 'high' | 'urgent'
      service_order_status:
        | 'draft'
        | 'pending'
        | 'scheduled'
        | 'in_progress'
        | 'paused'
        | 'in_audit'
        | 'completed'
        | 'rejected'
        | 'cancelled'
      sla_status: 'within_sla' | 'warning' | 'breached'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      checklist_status: ['pending', 'in_progress', 'completed'],
      service_order_priority: ['low', 'medium', 'high', 'urgent'],
      service_order_status: [
        'draft',
        'pending',
        'scheduled',
        'in_progress',
        'paused',
        'in_audit',
        'completed',
        'rejected',
        'cancelled',
      ],
      sla_status: ['within_sla', 'warning', 'breached'],
    },
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: audits
//   id: uuid (not null, default: gen_random_uuid())
//   table_name: character varying (not null)
//   record_id: uuid (not null)
//   action: character varying (not null)
//   old_value: jsonb (nullable)
//   new_value: jsonb (nullable)
//   user_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: checklist_items
//   id: uuid (not null, default: gen_random_uuid())
//   checklist_id: uuid (not null)
//   label: character varying (not null)
//   field_type: character varying (not null)
//   is_required: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: checklist_responses
//   id: uuid (not null, default: gen_random_uuid())
//   service_order_checklist_id: uuid (not null)
//   checklist_item_id: uuid (not null)
//   response_text: text (nullable)
//   response_boolean: boolean (nullable)
//   response_number: numeric (nullable)
//   photo_url: character varying (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: checklists
//   id: uuid (not null, default: gen_random_uuid())
//   title: character varying (not null)
//   description: text (nullable)
//   created_by: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: clients
//   id: uuid (not null, default: gen_random_uuid())
//   name: character varying (not null)
//   document: character varying (not null)
//   email: character varying (nullable)
//   phone: character varying (nullable)
//   address: text (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: contracts
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: uuid (not null)
//   start_date: date (not null)
//   end_date: date (not null)
//   value: numeric (nullable)
//   terms: text (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: inventory
//   id: uuid (not null, default: gen_random_uuid())
//   material_id: uuid (not null)
//   quantity: integer (not null, default: 0)
//   location: character varying (nullable)
//   min_stock_level: integer (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: logs
//   id: uuid (not null, default: gen_random_uuid())
//   level: character varying (not null)
//   message: text (not null)
//   context: jsonb (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: materials
//   id: uuid (not null, default: gen_random_uuid())
//   name: character varying (not null)
//   unit_type: character varying (nullable)
//   sku: character varying (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: photos
//   id: uuid (not null, default: gen_random_uuid())
//   service_order_id: uuid (not null)
//   type: character varying (not null)
//   storage_url: character varying (not null)
//   uploaded_by: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: roles
//   id: uuid (not null, default: gen_random_uuid())
//   name: character varying (not null)
//   description: text (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: service_order_checklists
//   id: uuid (not null, default: gen_random_uuid())
//   service_order_id: uuid (not null)
//   checklist_id: uuid (not null)
//   status: checklist_status (nullable, default: 'pending'::checklist_status)
//   completed_at: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: service_order_materials
//   id: uuid (not null, default: gen_random_uuid())
//   service_order_id: uuid (not null)
//   material_id: uuid (not null)
//   quantity_used: integer (not null)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: service_orders
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: uuid (not null)
//   technician_id: uuid (nullable)
//   status: service_order_status (not null, default: 'pending'::service_order_status)
//   priority: service_order_priority (not null, default: 'medium'::service_order_priority)
//   description: text (nullable)
//   scheduled_at: timestamp with time zone (nullable)
//   deadline_at: timestamp with time zone (nullable)
//   sla_status: sla_status (nullable, default: 'within_sla'::sla_status)
//   started_at: timestamp with time zone (nullable)
//   last_resumed_at: timestamp with time zone (nullable)
//   paused_at: timestamp with time zone (nullable)
//   finished_at: timestamp with time zone (nullable)
//   total_duration_minutes: integer (nullable, default: 0)
//   latitude: numeric (nullable)
//   longitude: numeric (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   deleted_at: timestamp with time zone (nullable)
// Table: teams
//   id: uuid (not null, default: gen_random_uuid())
//   name: character varying (not null)
//   supervisor_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: technicians
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   team_id: uuid (nullable)
//   specialty: character varying (nullable)
//   availability_status: character varying (nullable, default: 'available'::character varying)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: user_roles
//   user_id: uuid (not null)
//   role_id: uuid (not null)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
// Table: users
//   id: uuid (not null, default: gen_random_uuid())
//   name: character varying (not null)
//   email: character varying (not null)
//   password_hash: character varying (not null)
//   status: character varying (nullable, default: 'active'::character varying)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   avatar_url: text (nullable)
// Table: vehicles
//   id: uuid (not null, default: gen_random_uuid())
//   plate: character varying (not null)
//   model: character varying (nullable)
//   brand: character varying (nullable)
//   technician_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)

// --- CONSTRAINTS ---
// Table: audits
//   PRIMARY KEY audits_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audits_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
// Table: checklist_items
//   FOREIGN KEY checklist_items_checklist_id_fkey: FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON UPDATE CASCADE ON DELETE CASCADE
//   PRIMARY KEY checklist_items_pkey: PRIMARY KEY (id)
// Table: checklist_responses
//   FOREIGN KEY checklist_responses_checklist_item_id_fkey: FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id) ON UPDATE CASCADE ON DELETE CASCADE
//   PRIMARY KEY checklist_responses_pkey: PRIMARY KEY (id)
//   FOREIGN KEY checklist_responses_service_order_checklist_id_fkey: FOREIGN KEY (service_order_checklist_id) REFERENCES service_order_checklists(id) ON UPDATE CASCADE ON DELETE CASCADE
// Table: checklists
//   FOREIGN KEY checklists_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
//   PRIMARY KEY checklists_pkey: PRIMARY KEY (id)
// Table: clients
//   UNIQUE clients_document_key: UNIQUE (document)
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
// Table: contracts
//   FOREIGN KEY contracts_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE CASCADE ON DELETE CASCADE
//   PRIMARY KEY contracts_pkey: PRIMARY KEY (id)
// Table: inventory
//   FOREIGN KEY inventory_material_id_fkey: FOREIGN KEY (material_id) REFERENCES materials(id) ON UPDATE CASCADE ON DELETE CASCADE
//   PRIMARY KEY inventory_pkey: PRIMARY KEY (id)
//   CHECK inventory_quantity_check: CHECK ((quantity >= 0))
// Table: logs
//   PRIMARY KEY logs_pkey: PRIMARY KEY (id)
// Table: materials
//   PRIMARY KEY materials_pkey: PRIMARY KEY (id)
//   UNIQUE materials_sku_key: UNIQUE (sku)
// Table: photos
//   PRIMARY KEY photos_pkey: PRIMARY KEY (id)
//   FOREIGN KEY photos_service_order_id_fkey: FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON UPDATE CASCADE ON DELETE CASCADE
//   CHECK photos_type_check: CHECK (((type)::text = ANY ((ARRAY['initial'::character varying, 'final'::character varying])::text[])))
//   FOREIGN KEY photos_uploaded_by_fkey: FOREIGN KEY (uploaded_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
// Table: roles
//   UNIQUE roles_name_key: UNIQUE (name)
//   PRIMARY KEY roles_pkey: PRIMARY KEY (id)
// Table: service_order_checklists
//   FOREIGN KEY service_order_checklists_checklist_id_fkey: FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON UPDATE CASCADE ON DELETE CASCADE
//   PRIMARY KEY service_order_checklists_pkey: PRIMARY KEY (id)
//   FOREIGN KEY service_order_checklists_service_order_id_fkey: FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON UPDATE CASCADE ON DELETE CASCADE
// Table: service_order_materials
//   FOREIGN KEY service_order_materials_material_id_fkey: FOREIGN KEY (material_id) REFERENCES materials(id) ON UPDATE CASCADE ON DELETE CASCADE
//   PRIMARY KEY service_order_materials_pkey: PRIMARY KEY (id)
//   CHECK service_order_materials_quantity_used_check: CHECK ((quantity_used > 0))
//   FOREIGN KEY service_order_materials_service_order_id_fkey: FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON UPDATE CASCADE ON DELETE CASCADE
// Table: service_orders
//   FOREIGN KEY service_orders_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE CASCADE ON DELETE CASCADE
//   PRIMARY KEY service_orders_pkey: PRIMARY KEY (id)
//   FOREIGN KEY service_orders_technician_id_fkey: FOREIGN KEY (technician_id) REFERENCES technicians(id) ON UPDATE CASCADE ON DELETE SET NULL
// Table: teams
//   PRIMARY KEY teams_pkey: PRIMARY KEY (id)
//   FOREIGN KEY teams_supervisor_id_fkey: FOREIGN KEY (supervisor_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL
// Table: technicians
//   PRIMARY KEY technicians_pkey: PRIMARY KEY (id)
//   FOREIGN KEY technicians_team_id_fkey: FOREIGN KEY (team_id) REFERENCES teams(id) ON UPDATE CASCADE ON DELETE SET NULL
//   FOREIGN KEY technicians_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
// Table: user_roles
//   PRIMARY KEY user_roles_pkey: PRIMARY KEY (user_id, role_id)
//   FOREIGN KEY user_roles_role_id_fkey: FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE ON DELETE CASCADE
//   FOREIGN KEY user_roles_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
// Table: users
//   UNIQUE users_email_key: UNIQUE (email)
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
//   CHECK users_status_check: CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::text[])))
// Table: vehicles
//   PRIMARY KEY vehicles_pkey: PRIMARY KEY (id)
//   UNIQUE vehicles_plate_key: UNIQUE (plate)
//   FOREIGN KEY vehicles_technician_id_fkey: FOREIGN KEY (technician_id) REFERENCES technicians(id) ON UPDATE CASCADE ON DELETE SET NULL

// --- DATABASE FUNCTIONS ---
// FUNCTION audit_service_order_status_change()
//   CREATE OR REPLACE FUNCTION public.audit_service_order_status_change()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF OLD.status IS DISTINCT FROM NEW.status THEN
//       INSERT INTO audits (table_name, record_id, action, old_value, new_value)
//       VALUES (
//         'service_orders',
//         NEW.id,
//         'UPDATE',
//         jsonb_build_object('status', OLD.status::text),
//         jsonb_build_object('status', NEW.status::text)
//       );
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION trigger_set_timestamp()
//   CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = CURRENT_TIMESTAMP;
//     RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: audits
//   set_timestamp_audits: CREATE TRIGGER set_timestamp_audits BEFORE UPDATE ON public.audits FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: checklist_items
//   set_timestamp_checklist_items: CREATE TRIGGER set_timestamp_checklist_items BEFORE UPDATE ON public.checklist_items FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: checklist_responses
//   set_timestamp_checklist_responses: CREATE TRIGGER set_timestamp_checklist_responses BEFORE UPDATE ON public.checklist_responses FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: checklists
//   set_timestamp_checklists: CREATE TRIGGER set_timestamp_checklists BEFORE UPDATE ON public.checklists FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: clients
//   set_timestamp_clients: CREATE TRIGGER set_timestamp_clients BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: contracts
//   set_timestamp_contracts: CREATE TRIGGER set_timestamp_contracts BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: inventory
//   set_timestamp_inventory: CREATE TRIGGER set_timestamp_inventory BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: logs
//   set_timestamp_logs: CREATE TRIGGER set_timestamp_logs BEFORE UPDATE ON public.logs FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: materials
//   set_timestamp_materials: CREATE TRIGGER set_timestamp_materials BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: photos
//   set_timestamp_photos: CREATE TRIGGER set_timestamp_photos BEFORE UPDATE ON public.photos FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: roles
//   set_timestamp_roles: CREATE TRIGGER set_timestamp_roles BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: service_order_checklists
//   set_timestamp_service_order_checklists: CREATE TRIGGER set_timestamp_service_order_checklists BEFORE UPDATE ON public.service_order_checklists FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: service_order_materials
//   set_timestamp_service_order_materials: CREATE TRIGGER set_timestamp_service_order_materials BEFORE UPDATE ON public.service_order_materials FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: service_orders
//   audit_service_order_status: CREATE TRIGGER audit_service_order_status AFTER UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION audit_service_order_status_change()
//   set_timestamp_service_orders: CREATE TRIGGER set_timestamp_service_orders BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: teams
//   set_timestamp_teams: CREATE TRIGGER set_timestamp_teams BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: technicians
//   set_timestamp_technicians: CREATE TRIGGER set_timestamp_technicians BEFORE UPDATE ON public.technicians FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: user_roles
//   set_timestamp_user_roles: CREATE TRIGGER set_timestamp_user_roles BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: users
//   set_timestamp_users: CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
// Table: vehicles
//   set_timestamp_vehicles: CREATE TRIGGER set_timestamp_vehicles BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()

// --- INDEXES ---
// Table: audits
//   CREATE INDEX idx_audits_user_id ON public.audits USING btree (user_id)
// Table: checklist_items
//   CREATE INDEX idx_checklist_items_checklist_id ON public.checklist_items USING btree (checklist_id)
// Table: checklist_responses
//   CREATE INDEX idx_checklist_responses_so_chk_id ON public.checklist_responses USING btree (service_order_checklist_id)
// Table: checklists
//   CREATE INDEX idx_checklists_created_by ON public.checklists USING btree (created_by)
// Table: clients
//   CREATE UNIQUE INDEX clients_document_key ON public.clients USING btree (document)
//   CREATE INDEX idx_clients_document ON public.clients USING btree (document)
// Table: contracts
//   CREATE INDEX idx_contracts_client_id ON public.contracts USING btree (client_id)
// Table: inventory
//   CREATE INDEX idx_inventory_material_id ON public.inventory USING btree (material_id)
// Table: materials
//   CREATE UNIQUE INDEX materials_sku_key ON public.materials USING btree (sku)
// Table: photos
//   CREATE INDEX idx_photos_service_order_id ON public.photos USING btree (service_order_id)
//   CREATE INDEX idx_photos_uploaded_by ON public.photos USING btree (uploaded_by)
// Table: roles
//   CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name)
// Table: service_order_checklists
//   CREATE INDEX idx_so_checklists_checklist_id ON public.service_order_checklists USING btree (checklist_id)
//   CREATE INDEX idx_so_checklists_so_id ON public.service_order_checklists USING btree (service_order_id)
// Table: service_order_materials
//   CREATE INDEX idx_so_materials_material_id ON public.service_order_materials USING btree (material_id)
//   CREATE INDEX idx_so_materials_so_id ON public.service_order_materials USING btree (service_order_id)
// Table: service_orders
//   CREATE INDEX idx_service_orders_client_id ON public.service_orders USING btree (client_id)
//   CREATE INDEX idx_service_orders_priority ON public.service_orders USING btree (priority)
//   CREATE INDEX idx_service_orders_sla_status ON public.service_orders USING btree (sla_status)
//   CREATE INDEX idx_service_orders_status ON public.service_orders USING btree (status)
//   CREATE INDEX idx_service_orders_technician_id ON public.service_orders USING btree (technician_id)
// Table: teams
//   CREATE INDEX idx_teams_supervisor_id ON public.teams USING btree (supervisor_id)
// Table: technicians
//   CREATE INDEX idx_technicians_team_id ON public.technicians USING btree (team_id)
//   CREATE INDEX idx_technicians_user_id ON public.technicians USING btree (user_id)
// Table: user_roles
//   CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id)
//   CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id)
// Table: users
//   CREATE INDEX idx_users_email ON public.users USING btree (email)
//   CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)
// Table: vehicles
//   CREATE INDEX idx_vehicles_technician_id ON public.vehicles USING btree (technician_id)
//   CREATE UNIQUE INDEX vehicles_plate_key ON public.vehicles USING btree (plate)
