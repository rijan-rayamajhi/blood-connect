import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DiscoveryState {
    radiusKm: number
    bloodGroup: string | null
    quantity: number | null
    maxResponseTime: number | null
    userLocation: { latitude: number; longitude: number } | null

    setFilters: (filters: Partial<Omit<DiscoveryState, 'setFilters' | 'resetFilters' | 'setUserLocation'>>) => void
    resetFilters: () => void
    setUserLocation: (lat: number, lon: number) => void
}

export const useDiscoveryStore = create<DiscoveryState>()(
    persist(
        (set) => ({
            radiusKm: 10,
            bloodGroup: null,
            quantity: null,
            maxResponseTime: null,
            userLocation: null, // Default to null until explicitly set or requested

            setFilters: (filters) => set((state) => ({ ...state, ...filters })),

            resetFilters: () => set({
                radiusKm: 10,
                bloodGroup: null,
                quantity: null,
                maxResponseTime: null,
                // Do not reset userLocation when resetting filters
            }),

            setUserLocation: (latitude, longitude) => set({ userLocation: { latitude, longitude } })
        }),
        {
            name: 'blood-discovery-filters',
        }
    )
)
