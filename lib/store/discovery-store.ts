import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

export interface RankedBloodBank {
    id: string
    name: string
    latitude: number
    longitude: number
    averageResponseMinutes: number
    distanceKm?: number
    inventory: {
        bloodGroup: string
        quantity: number
    }[]
}

interface DiscoveryState {
    // Search Filters
    radiusKm: number
    bloodGroup: string | null
    quantity: number | null
    maxResponseTime: number | null
    userLocation: { latitude: number; longitude: number } | null

    // Result State
    bloodBanks: RankedBloodBank[]
    isLoading: boolean
    error: string | null
    isRealtimeEnabled: boolean

    // Actions
    setFilters: (filters: Partial<Pick<DiscoveryState, 'radiusKm' | 'bloodGroup' | 'quantity' | 'maxResponseTime'>>) => void
    resetFilters: () => void
    setUserLocation: (lat: number, lon: number) => void

    // Data fetching & Live subscription
    fetchBloodBanks: () => Promise<void>
    enableRealtime: () => void
    disableRealtime: () => void
}

import type { RealtimeChannel } from '@supabase/supabase-js'

let realtimeSubscription: RealtimeChannel | null = null

export const useDiscoveryStore = create<DiscoveryState>()(
    persist(
        (set, get) => ({
            radiusKm: 10,
            bloodGroup: null,
            quantity: null,
            maxResponseTime: null,
            userLocation: null,

            bloodBanks: [],
            isLoading: false,
            error: null,
            isRealtimeEnabled: false,

            setFilters: (filters) => {
                set((state) => ({ ...state, ...filters }))
                // Trigger a re-fetch when filters change and we have a location
                if (get().userLocation) {
                    get().fetchBloodBanks()
                }
            },

            resetFilters: () => {
                set({
                    radiusKm: 10,
                    bloodGroup: null,
                    quantity: null,
                    maxResponseTime: null,
                })
                if (get().userLocation) {
                    get().fetchBloodBanks()
                }
            },

            setUserLocation: (latitude, longitude) => {
                const prev = get().userLocation
                // Only set and fetch if location actually changed significantly to avoid spam
                if (!prev || Math.abs(prev.latitude - latitude) > 0.001 || Math.abs(prev.longitude - longitude) > 0.001) {
                    set({ userLocation: { latitude, longitude } })
                    get().fetchBloodBanks()
                }
            },

            fetchBloodBanks: async () => {
                const { userLocation, radiusKm, bloodGroup, quantity, maxResponseTime } = get()

                if (!userLocation) return

                set({ isLoading: true, error: null })

                try {
                    const params = new URLSearchParams()
                    params.append('lat', userLocation.latitude.toString())
                    params.append('lng', userLocation.longitude.toString())
                    params.append('radiusKm', radiusKm.toString())

                    if (bloodGroup) params.append('bloodGroup', bloodGroup)
                    if (quantity) params.append('quantity', quantity.toString())
                    if (maxResponseTime) params.append('maxResponseTime', maxResponseTime.toString())

                    const res = await fetch(`/api/blood-banks/discover?${params.toString()}`)
                    const json = await res.json()

                    if (!json.success) {
                        throw new Error(json.error || 'Failed to fetch blood banks')
                    }

                    set({ bloodBanks: json.data, isLoading: false })
                } catch (err: unknown) {
                    set({ error: err instanceof Error ? err.message : 'An error occurred', isLoading: false })
                }
            },

            enableRealtime: () => {
                const { isRealtimeEnabled, fetchBloodBanks } = get()
                if (isRealtimeEnabled) return

                const supabase = createClient()

                realtimeSubscription = supabase
                    .channel('discovery_inventory_changes')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'inventory' },
                        () => {
                            // Re-fetch the discovery results dynamically to reflect inventory changes
                            // Optimizations could patch the store directly, but re-fetching ensures accurate ranking
                            fetchBloodBanks()
                        }
                    )
                    .subscribe()

                set({ isRealtimeEnabled: true })
            },

            disableRealtime: () => {
                if (realtimeSubscription) {
                    realtimeSubscription.unsubscribe()
                    realtimeSubscription = null
                }
                set({ isRealtimeEnabled: false })
            }
        }),
        {
            name: 'blood-discovery-filters',
            // Only persist filters and location, not the transient data/loading state
            partialize: (state) => ({
                radiusKm: state.radiusKm,
                bloodGroup: state.bloodGroup,
                quantity: state.quantity,
                maxResponseTime: state.maxResponseTime,
                userLocation: state.userLocation
            })
        }
    )
)
