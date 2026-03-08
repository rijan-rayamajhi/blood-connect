import { create } from 'zustand'

export interface AdminMetrics {
    total_blood_banks: number
    total_hospitals: number
    active_users: number
    total_requests: number
    active_emergency_requests: number
    pending_requests: number
    fulfilled_requests: number
}

interface AdminAnalyticsState {
    metrics: AdminMetrics | null
    supplyDemand: Record<string, unknown>[]
    emergencies: Record<string, unknown>[]
    organizationActivity: Record<string, unknown>[]
    isLoading: boolean
    error: string | null
    fetchMetrics: () => Promise<void>
}

export const useAdminAnalyticsStore = create<AdminAnalyticsState>((set) => ({
    metrics: null,
    supplyDemand: [],
    emergencies: [],
    organizationActivity: [],
    isLoading: false,
    error: null,
    fetchMetrics: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch('/api/admin/metrics')
            if (!response.ok) throw new Error('Failed to fetch admin metrics')

            const data = await response.json()
            set({
                metrics: data.metrics,
                supplyDemand: data.supplyDemand,
                emergencies: data.emergencies,
                organizationActivity: data.organizationActivity,
                isLoading: false
            })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred"
            set({ error: message, isLoading: false })
        }
    }
}))
