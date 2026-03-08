import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export type StaffRole = "Admin" | "Inventory Manager" | "Request Handler" | "Viewer"
export type StaffStatus = "Active" | "Offline"

export type Staff = {
    id: string
    organization_id: string
    name: string
    email: string
    role: StaffRole
    status: StaffStatus
    last_active: string // ISO Date string
    phone: string
    created_at?: string
    updated_at?: string
}

interface StaffState {
    staffList: Staff[]
    isLoading: boolean
    error: string | null
    isSubscribed: boolean
    fetchStaff: () => Promise<void>
    addStaff: (staff: Omit<Staff, 'id' | 'status' | 'last_active' | 'organization_id' | 'created_at' | 'updated_at'>) => Promise<void>
    updateStaff: (id: string, staff: Partial<Staff>) => Promise<void>
    deleteStaff: (id: string) => Promise<void>
    subscribeToStaff: (organizationId: string) => void
    unsubscribeFromStaff: () => void
}

let realtimeSubscription: RealtimeChannel | null = null;

export const useStaffStore = create<StaffState>()((set, get) => ({
    staffList: [],
    isLoading: false,
    error: null,
    isSubscribed: false,

    fetchStaff: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch('/api/staff')
            if (!response.ok) {
                throw new Error('Failed to fetch staff')
            }
            const data = await response.json()
            set({ staffList: data, isLoading: false })
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false })
        }
    },

    addStaff: async (newStaff) => {
        try {
            const response = await fetch('/api/staff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStaff)
            })
            if (!response.ok) throw new Error('Failed to create staff')
            const created = await response.json()
            // We can optionally wait for the realtime event or add it directly
            set((state) => ({ staffList: [created, ...state.staffList] }))
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message : 'An error occurred' })
            throw error
        }
    },

    updateStaff: async (id, updatedStaff) => {
        try {
            const response = await fetch(`/api/staff/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStaff)
            })
            if (!response.ok) throw new Error('Failed to update staff')
            const updated = await response.json()
            set((state) => ({
                staffList: state.staffList.map((s) => s.id === id ? updated : s)
            }))
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message : 'An error occurred' })
            throw error
        }
    },

    deleteStaff: async (id) => {
        try {
            const response = await fetch(`/api/staff/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed to delete staff')
            set((state) => ({
                staffList: state.staffList.filter((s) => s.id !== id)
            }))
        } catch (error: unknown) {
            set({ error: error instanceof Error ? error.message : 'An error occurred' })
            throw error
        }
    },

    subscribeToStaff: (organizationId: string) => {
        if (get().isSubscribed) return;

        const supabase = createClient();

        realtimeSubscription = supabase
            .channel(`staff_${organizationId}`)
            .on(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                'postgres_changes' as any,
                {
                    event: '*',
                    schema: 'public',
                    table: 'staff',
                    filter: `organization_id=eq.${organizationId}`
                },
                (payload: { eventType: string; new: Staff; old: { id: string } }) => {
                    const currentStaff = get().staffList;
                    if (payload.eventType === 'INSERT') {
                        const newStaff = payload.new;
                        if (!currentStaff.find(s => s.id === newStaff.id)) {
                            set({ staffList: [newStaff, ...currentStaff] });
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        set({
                            staffList: currentStaff.map(s =>
                                s.id === payload.new.id ? { ...s, ...payload.new } : s
                            )
                        });
                    } else if (payload.eventType === 'DELETE') {
                        set({
                            staffList: currentStaff.filter(s => s.id !== payload.old.id)
                        });
                    }
                }
            )
            .subscribe();

        set({ isSubscribed: true });
    },

    unsubscribeFromStaff: () => {
        if (realtimeSubscription) {
            const supabase = createClient();
            supabase.removeChannel(realtimeSubscription);
            realtimeSubscription = null;
        }
        set({ isSubscribed: false });
    }
}))
