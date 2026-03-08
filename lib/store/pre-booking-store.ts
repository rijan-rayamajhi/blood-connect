import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type PreBookingStatus = 'scheduled' | 'fulfilled' | 'cancelled'

export interface PreBooking {
    id: string
    hospitalId: string
    bloodGroup: string
    componentType: string
    quantity: number
    scheduledDate: string  // ISO string from DB
    notes: string | null
    status: PreBookingStatus
    autoConvert: boolean
    createdAt: string
    updatedAt: string
}

export interface CreatePreBookingPayload {
    bloodGroup: string
    componentType: string
    quantity: number
    scheduledDate: string // ISO string
    notes?: string
    autoConvert?: boolean
}

export interface UpdatePreBookingPayload {
    bloodGroup?: string
    componentType?: string
    quantity?: number
    scheduledDate?: string
    notes?: string
    status?: PreBookingStatus
    autoConvert?: boolean
}

interface PreBookingState {
    bookings: PreBooking[]
    isLoading: boolean
    error: string | null
    _realtimeChannel: RealtimeChannel | null

    fetchPreBookings: (filters?: { status?: string; from?: string; to?: string }) => Promise<void>
    createPreBooking: (payload: CreatePreBookingPayload) => Promise<PreBooking>
    updatePreBooking: (id: string, patch: UpdatePreBookingPayload) => Promise<void>
    cancelPreBooking: (id: string) => Promise<void>

    subscribeRealtime: (hospitalId: string) => void
    unsubscribeRealtime: () => void
}

export const usePreBookingStore = create<PreBookingState>()((set, get) => ({
    bookings: [],
    isLoading: false,
    error: null,
    _realtimeChannel: null,

    fetchPreBookings: async (filters) => {
        set({ isLoading: true, error: null })
        try {
            const params = new URLSearchParams()
            if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
            if (filters?.from) params.append('from', filters.from)
            if (filters?.to) params.append('to', filters.to)

            const qs = params.toString()
            const res = await fetch(`/api/pre-bookings${qs ? `?${qs}` : ''}`)
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to fetch pre-bookings')
            }

            set({ bookings: json.data, isLoading: false })
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Failed to fetch pre-bookings',
                isLoading: false,
            })
        }
    },

    createPreBooking: async (payload) => {
        set({ error: null })
        try {
            const res = await fetch('/api/pre-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to create pre-booking')
            }

            // Optimistically add to list (realtime will also update)
            set((state) => ({ bookings: [json.data, ...state.bookings] }))
            return json.data as PreBooking
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to create pre-booking'
            set({ error: msg })
            throw new Error(msg)
        }
    },

    updatePreBooking: async (id, patch) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/pre-bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to update pre-booking')
            }

            set((state) => ({
                bookings: state.bookings.map((b) => (b.id === id ? json.data : b)),
            }))
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to update pre-booking'
            set({ error: msg })
            throw new Error(msg)
        }
    },

    cancelPreBooking: async (id) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/pre-bookings/${id}`, {
                method: 'DELETE',
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to cancel pre-booking')
            }

            set((state) => ({
                bookings: state.bookings.map((b) =>
                    b.id === id ? { ...b, status: 'cancelled' as PreBookingStatus } : b
                ),
            }))
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to cancel pre-booking'
            set({ error: msg })
            throw new Error(msg)
        }
    },

    subscribeRealtime: (hospitalId) => {
        get().unsubscribeRealtime()

        const supabase = createClient()
        const channelName = `pre_bookings_${hospitalId}`

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'pre_bookings',
                    filter: `hospital_id=eq.${hospitalId}`,
                },
                () => {
                    // Re-fetch on any change for consistency
                    get().fetchPreBookings()
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
