import { create } from 'zustand'
import { BloodGroup } from './inventory-store'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type DonorStatus = "Available" | "Ineligible" | "Temporary Deferral"

export type Donor = {
    id: string
    organizationId: string
    fullName: string
    bloodGroup: BloodGroup
    age: number
    lastDonationDate: string | null // YYYY-MM-DD
    totalDonations: number
    status: DonorStatus
    contactNumber: string
    email: string
    createdAt: string
    updatedAt: string
}

export type DonorDonation = {
    id: string
    donorId: string
    donationDate: string
    bloodGroup: string
    componentType: string
    quantity: number
    notes: string | null
    createdAt: string
}

interface DonorState {
    donors: Donor[]
    isLoading: boolean
    error: string | null
    _realtimeChannel: RealtimeChannel | null

    fetchDonors: (filters?: { blood_group?: string; status?: string; organization_id?: string }) => Promise<void>
    addDonor: (donor: Omit<Donor, 'id' | 'status' | 'totalDonations' | 'organizationId' | 'lastDonationDate' | 'createdAt' | 'updatedAt'> & { lastDonationDate?: string }) => Promise<void>
    updateDonor: (id: string, donor: Partial<Donor>) => Promise<void>
    deleteDonor: (id: string) => Promise<void>
    recordDonation: (id: string, donation: { donationDate: string; componentType: string; quantity: number; notes?: string }) => Promise<void>

    // Realtime
    subscribeRealtime: (organizationId: string) => void
    unsubscribeRealtime: () => void
}

export const useDonorStore = create<DonorState>()((set, get) => ({
    donors: [],
    isLoading: false,
    error: null,
    _realtimeChannel: null,

    fetchDonors: async (filters = {}) => {
        set({ isLoading: true, error: null })
        try {
            const queryParams = new URLSearchParams()
            if (filters.blood_group) queryParams.append('blood_group', filters.blood_group)
            if (filters.status) queryParams.append('status', filters.status)
            if (filters.organization_id) queryParams.append('organization_id', filters.organization_id)

            const url = `/api/donors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
            const res = await fetch(url)
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to fetch donors')
            }

            set({ donors: json.data || [], isLoading: false })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch donors'
            set({ error: message, isLoading: false })
        }
    },

    addDonor: async (newDonor) => {
        set({ error: null })
        try {
            const res = await fetch('/api/donors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDonor),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to add donor')
            }

            set((state) => ({
                donors: [json.data, ...state.donors],
            }))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add donor'
            set({ error: message })
            throw err
        }
    },

    updateDonor: async (id, updatedDonor) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/donors/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDonor),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to update donor')
            }

            set((state) => ({
                donors: state.donors.map((donor) =>
                    donor.id === id ? json.data : donor
                ),
            }))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update donor'
            set({ error: message })
            throw err
        }
    },

    deleteDonor: async (id) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/donors/${id}`, {
                method: 'DELETE',
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to delete donor')
            }

            set((state) => ({
                donors: state.donors.filter((donor) => donor.id !== id),
            }))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete donor'
            set({ error: message })
            throw err
        }
    },

    recordDonation: async (id, donation) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/donors/${id}/donations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donation),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to record donation')
            }

            // Refresh donors to get updated totalDonations, lastDonationDate, status from trigger
            get().fetchDonors()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to record donation'
            set({ error: message })
            throw err
        }
    },

    subscribeRealtime: (organizationId) => {
        get().unsubscribeRealtime()

        const supabase = createClient()
        const channelName = `donors_${organizationId}`

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'donors',
                    filter: `organization_id=eq.${organizationId}`,
                },
                () => {
                    // On any change, refresh the list
                    get().fetchDonors()
                }
            )
            .subscribe()

        set({ _realtimeChannel: channel })
    },

    unsubscribeRealtime: () => {
        const channel = get()._realtimeChannel
        if (channel) {
            const supabase = createClient()
            supabase.removeChannel(channel)
            set({ _realtimeChannel: null })
        }
    },
}))
