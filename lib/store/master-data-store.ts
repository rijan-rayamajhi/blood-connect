import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

// DB row shape for master_data table
interface MasterDataRow {
    id: number
    blood_groups: string[]
    component_types: string[]
    urgency_levels: UrgencyLevel[]
    notification_rules: NotificationRule[]
    updated_at: string
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface UrgencyLevel {
    label: string
    slaMinutes: number
    escalationMinutes: number
}

export interface NotificationRule {
    priority: "normal" | "moderate" | "critical"
    soundEnabled: boolean
    autoDismissSeconds: number | null
}

interface MasterDataState {
    bloodGroups: string[]
    componentTypes: string[]
    urgencyLevels: UrgencyLevel[]
    notificationRules: NotificationRule[]
    isLoading: boolean
    isHydrated: boolean
    error: string | null

    fetchMasterData: () => Promise<void>
    addBloodGroup: (group: string) => boolean
    removeBloodGroup: (group: string) => void
    addComponentType: (type: string) => boolean
    removeComponentType: (type: string) => void
    addUrgencyLevel: (level: UrgencyLevel) => void
    updateUrgencyLevel: (index: number, level: UrgencyLevel) => void
    removeUrgencyLevel: (index: number) => void
    updateNotificationRule: (index: number, rule: NotificationRule) => void
}

// ── Defaults (fallback when Supabase is unreachable) ─────────────────────────

const DEFAULT_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
const DEFAULT_COMPONENT_TYPES = ["Whole Blood", "Packed RBC", "Platelets", "Plasma", "Cryoprecipitate"]
const DEFAULT_URGENCY_LEVELS: UrgencyLevel[] = [
    { label: "Critical", slaMinutes: 30, escalationMinutes: 15 },
    { label: "Moderate", slaMinutes: 120, escalationMinutes: 60 },
    { label: "Normal", slaMinutes: 480, escalationMinutes: 240 },
]
const DEFAULT_NOTIFICATION_RULES: NotificationRule[] = [
    { priority: "critical", soundEnabled: true, autoDismissSeconds: null },
    { priority: "moderate", soundEnabled: true, autoDismissSeconds: 10 },
    { priority: "normal", soundEnabled: false, autoDismissSeconds: 5 },
]

// ── Store ────────────────────────────────────────────────────────────────────

export const useMasterDataStore = create<MasterDataState>()(
    persist(
        (set, get) => ({
            // Initialize with defaults
            bloodGroups: DEFAULT_BLOOD_GROUPS,
            componentTypes: DEFAULT_COMPONENT_TYPES,
            urgencyLevels: DEFAULT_URGENCY_LEVELS,
            notificationRules: DEFAULT_NOTIFICATION_RULES,
            isLoading: false,
            isHydrated: false,
            error: null,

            fetchMasterData: async () => {
                // Skip if already successfully hydrated from DB
                if (get().isHydrated) return

                set({ isLoading: true, error: null })
                try {
                    const supabase = createClient()
                    const { data, error } = await supabase
                        .from('master_data')
                        .select('*')
                        .single<MasterDataRow>()

                    if (error) throw error

                    if (data) {
                        set({
                            bloodGroups: data.blood_groups ?? DEFAULT_BLOOD_GROUPS,
                            componentTypes: data.component_types ?? DEFAULT_COMPONENT_TYPES,
                            urgencyLevels: data.urgency_levels ?? DEFAULT_URGENCY_LEVELS,
                            notificationRules: data.notification_rules ?? DEFAULT_NOTIFICATION_RULES,
                            isHydrated: true,
                            isLoading: false,
                        })
                    }
                } catch (err) {
                    console.warn('[MasterData] Failed to fetch from Supabase, using defaults:', err)
                    set({
                        isLoading: false,
                        error: err instanceof Error ? err.message : 'Failed to fetch master data',
                        // Keep existing values (defaults or localStorage cache)
                    })
                }
            },

            addBloodGroup: (group: string): boolean => {
                const { bloodGroups } = get()
                if (bloodGroups.includes(group)) return false
                set({ bloodGroups: [...bloodGroups, group] })
                return true
            },

            removeBloodGroup: (group: string) => {
                set((state) => ({
                    bloodGroups: state.bloodGroups.filter((g) => g !== group),
                }))
            },

            addComponentType: (type: string): boolean => {
                const { componentTypes } = get()
                if (componentTypes.includes(type)) return false
                set({ componentTypes: [...componentTypes, type] })
                return true
            },

            removeComponentType: (type: string) => {
                set((state) => ({
                    componentTypes: state.componentTypes.filter((t) => t !== type),
                }))
            },

            addUrgencyLevel: (level: UrgencyLevel) => {
                set((state) => ({
                    urgencyLevels: [...state.urgencyLevels, level],
                }))
            },

            updateUrgencyLevel: (index: number, level: UrgencyLevel) => {
                set((state) => ({
                    urgencyLevels: state.urgencyLevels.map((l, i) =>
                        i === index ? level : l
                    ),
                }))
            },

            removeUrgencyLevel: (index: number) => {
                set((state) => ({
                    urgencyLevels: state.urgencyLevels.filter((_, i) => i !== index),
                }))
            },

            updateNotificationRule: (index: number, rule: NotificationRule) => {
                set((state) => ({
                    notificationRules: state.notificationRules.map((r, i) =>
                        i === index ? rule : r
                    ),
                }))
            },
        }),
        {
            name: 'blood-connect-master-data',
        }
    )
)
