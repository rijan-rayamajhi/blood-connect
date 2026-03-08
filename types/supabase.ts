
/** Supabase Database Types */
export type UserRole = 'admin' | 'hospital' | 'blood-bank'
export type OrgType = 'hospital' | 'blood-bank'
export type OrgStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type AnnouncementPriority = 'normal' | 'moderate' | 'critical'
export type InventoryStatusDB = 'available' | 'reserved' | 'expired' | 'near-expiry'

export interface Database {
  public: {
    Tables: {
      inventory: {
        Row: {
          id: string
          organization_id: string
          blood_group: string
          component_type: string
          quantity: number
          collection_date: string
          expiry_date: string
          status: InventoryStatusDB
          reserved_for_request_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          blood_group: string
          component_type: string
          quantity: number
          collection_date: string
          expiry_date: string
          status?: InventoryStatusDB
          reserved_for_request_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          organization_id?: string
          blood_group?: string
          component_type?: string
          quantity?: number
          collection_date?: string
          expiry_date?: string
          status?: InventoryStatusDB
          reserved_for_request_id?: string | null
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          type: OrgType
          email: string
          latitude: number | null
          longitude: number | null
          status: OrgStatus
          documents: Record<string, string>
          review_remarks: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: OrgType
          email: string
          latitude?: number | null
          longitude?: number | null
          status?: OrgStatus
          documents?: Record<string, string>
          review_remarks?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: OrgType
          email?: string
          latitude?: number | null
          longitude?: number | null
          status?: OrgStatus
          documents?: Record<string, string>
          review_remarks?: string | null
          reviewed_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          name: string
          email: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          name: string
          email: string
          role: UserRole
          created_at?: string
        }
        Update: {
          organization_id?: string | null
          name?: string
          email?: string
          role?: UserRole
        }
      }
      audit_events: {
        Row: {
          id: string
          actor_id: string | null
          actor_role: string
          action: string
          target_id: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          actor_role: string
          action: string
          target_id?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          actor_role?: string
          action?: string
          target_id?: string | null
          metadata?: Record<string, unknown>
        }
      }
      system_config: {
        Row: {
          id: number
          sla_response_minutes: number
          emergency_escalation_minutes: number
          stuck_request_threshold_minutes: number
          low_stock_threshold: number
          near_expiry_hours: number
          announcement_message: string | null
          announcement_priority: AnnouncementPriority | null
          updated_at: string
        }
        Insert: {
          id?: number
          sla_response_minutes?: number
          emergency_escalation_minutes?: number
          stuck_request_threshold_minutes?: number
          low_stock_threshold?: number
          near_expiry_hours?: number
          announcement_message?: string | null
          announcement_priority?: AnnouncementPriority | null
        }
        Update: {
          sla_response_minutes?: number
          emergency_escalation_minutes?: number
          stuck_request_threshold_minutes?: number
          low_stock_threshold?: number
          near_expiry_hours?: number
          announcement_message?: string | null
          announcement_priority?: AnnouncementPriority | null
        }
      }
      master_data: {
        Row: {
          id: number
          blood_groups: string[]
          component_types: string[]
          urgency_levels: Array<{
            label: string
            slaMinutes: number
            escalationMinutes: number
          }>
          notification_rules: Array<{
            priority: string
            soundEnabled: boolean
            autoDismissSeconds: number | null
          }>
          updated_at: string
        }
        Insert: {
          id?: number
          blood_groups?: string[]
          component_types?: string[]
          urgency_levels?: Array<{
            label: string
            slaMinutes: number
            escalationMinutes: number
          }>
          notification_rules?: Array<{
            priority: string
            soundEnabled: boolean
            autoDismissSeconds: number | null
          }>
        }
        Update: {
          blood_groups?: string[]
          component_types?: string[]
          urgency_levels?: Array<{
            label: string
            slaMinutes: number
            escalationMinutes: number
          }>
          notification_rules?: Array<{
            priority: string
            soundEnabled: boolean
            autoDismissSeconds: number | null
          }>
        }
      }
      staff: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string
          phone: string | null
          role: 'Admin' | 'Inventory Manager' | 'Request Handler' | 'Viewer'
          status: 'Active' | 'Offline'
          last_active: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          email: string
          phone?: string | null
          role: 'Admin' | 'Inventory Manager' | 'Request Handler' | 'Viewer'
          status?: 'Active' | 'Offline'
          last_active?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          organization_id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: 'Admin' | 'Inventory Manager' | 'Request Handler' | 'Viewer'
          status?: 'Active' | 'Offline'
          last_active?: string | null
        }
      }
    }
    Functions: {
      reserve_inventory_unit: {
        Args: {
          p_unit_id: string
          p_request_id: string
        }
        Returns: { success: boolean; error?: string }
      }
      release_inventory_unit: {
        Args: {
          p_unit_id: string
        }
        Returns: { success: boolean; error?: string }
      }
    }
  }
}
