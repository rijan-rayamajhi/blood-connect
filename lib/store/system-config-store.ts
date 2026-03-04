import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SystemConfig } from '@/types/system-config'
import { useNotificationStore } from './notification-store'
import { createClient } from '@/lib/supabase/client'

// DB row shape for system_config table
interface SystemConfigRow {
    id: number
    sla_response_minutes: number
    emergency_escalation_minutes: number
    stuck_request_threshold_minutes: number
    low_stock_threshold: number
    near_expiry_hours: number
    announcement_message: string | null
    announcement_priority: 'normal' | 'moderate' | 'critical' | null
    updated_at: string
}

interface SystemConfigState {
    config: SystemConfig
    isLoading: boolean
    isHydrated: boolean
    error: string | null
    fetchConfig: () => Promise<void>
    updateConfig: (partial: Partial<SystemConfig>) => void
    broadcastAnnouncement: (message: string, priority: "normal" | "moderate" | "critical") => void
    clearAnnouncement: () => void
}

const DEFAULT_CONFIG: SystemConfig = {
    slaResponseMinutes: 5,
    emergencyEscalationMinutes: 5,
    stuckRequestThresholdMinutes: 10,
    lowStockThreshold: 10,
    nearExpiryHours: 48,
    announcementMessage: null,
    announcementPriority: null
}

export const useSystemConfigStore = create<SystemConfigState>()(
    persist(
        (set, get) => ({
            config: DEFAULT_CONFIG,
            isLoading: false,
            isHydrated: false,
            error: null,

            fetchConfig: async () => {
                // Skip if already successfully hydrated from DB
                if (get().isHydrated) return

                set({ isLoading: true, error: null })
                try {
                    const supabase = createClient()
                    const { data, error } = await supabase
                        .from('system_config')
                        .select('*')
                        .single<SystemConfigRow>()

                    if (error) throw error

                    if (data) {
                        // Map snake_case DB columns to camelCase frontend interface
                        set({
                            config: {
                                slaResponseMinutes: data.sla_response_minutes,
                                emergencyEscalationMinutes: data.emergency_escalation_minutes,
                                stuckRequestThresholdMinutes: data.stuck_request_threshold_minutes,
                                lowStockThreshold: data.low_stock_threshold,
                                nearExpiryHours: data.near_expiry_hours,
                                announcementMessage: data.announcement_message,
                                announcementPriority: data.announcement_priority,
                            },
                            isHydrated: true,
                            isLoading: false,
                        })
                    }
                } catch (err) {
                    console.warn('[SystemConfig] Failed to fetch from Supabase, using defaults:', err)
                    set({
                        isLoading: false,
                        error: err instanceof Error ? err.message : 'Failed to fetch system config',
                        // Keep existing values (defaults or localStorage cache)
                    })
                }
            },

            updateConfig: (partial) => set((state) => ({
                config: { ...state.config, ...partial }
            })),

            broadcastAnnouncement: (message, priority) => {
                set((state) => ({
                    config: {
                        ...state.config,
                        announcementMessage: message,
                        announcementPriority: priority
                    }
                }))

                useNotificationStore.getState().addNotification({
                    id: `announcement-${Date.now()}`,
                    title: "System Announcement",
                    message,
                    priority
                })
            },

            clearAnnouncement: () => {
                set((state) => ({
                    config: {
                        ...state.config,
                        announcementMessage: null,
                        announcementPriority: null
                    }
                }))
            }
        }),
        {
            name: 'blood-connect-system-config'
        }
    )
)
