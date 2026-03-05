import { create } from 'zustand'
import { BloodUnit } from '@/types/inventory'
import { useNotificationStore } from './notification-store'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-"
export type ComponentType = "Whole Blood" | "Packed RBC" | "Platelets" | "Plasma" | "Cryoprecipitate"

// Extend BloodUnit for the store to use strict types
export interface InventoryItem extends BloodUnit {
    bloodGroup: BloodGroup
    componentType: ComponentType
}

interface InventoryState {
    items: InventoryItem[]
    isLoading: boolean
    error: string | null
    _realtimeChannel: RealtimeChannel | null

    // CRUD
    fetchItems: () => Promise<void>
    addItem: (item: Omit<InventoryItem, 'id' | 'status' | 'reservedForRequestId'>) => Promise<void>
    updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>
    deleteItem: (id: string) => Promise<void>

    // Reservation
    reserveUnit: (unitId: string, requestId: string) => Promise<void>
    releaseUnit: (unitId: string) => Promise<void>

    // Queries
    getLowStockGroups: (threshold?: number) => { group: BloodGroup; quantity: number }[]
    getNearExpiryUnits: () => InventoryItem[]
    getExpiredUnits: () => InventoryItem[]

    // Realtime
    subscribeRealtime: (organizationId: string) => void
    unsubscribeRealtime: () => void
}

// Helper: map API response row to InventoryItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToItem(row: any): InventoryItem {
    return {
        id: row.id,
        bloodGroup: row.bloodGroup || row.blood_group,
        componentType: row.componentType || row.component_type,
        quantity: row.quantity,
        collectionDate: row.collectionDate || row.collection_date,
        expiryDate: row.expiryDate || row.expiry_date,
        status: row.status,
        reservedForRequestId: row.reservedForRequestId ?? row.reserved_for_request_id ?? null,
    }
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
    items: [],
    isLoading: false,
    error: null,
    _realtimeChannel: null,

    fetchItems: async () => {
        set({ isLoading: true, error: null })
        try {
            const res = await fetch('/api/inventory')
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to fetch inventory')
            }

            const items = (json.data || []).map(mapRowToItem)
            set({ items, isLoading: false })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch inventory'
            set({ error: message, isLoading: false })
        }
    },

    addItem: async (newItem) => {
        set({ error: null })
        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bloodGroup: newItem.bloodGroup,
                    componentType: newItem.componentType,
                    quantity: newItem.quantity,
                    collectionDate: newItem.collectionDate,
                    expiryDate: newItem.expiryDate,
                }),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to add inventory item')
            }

            const item = mapRowToItem(json.data)

            // Trigger notifications for near-expiry / expired
            if (item.status === 'near-expiry') {
                useNotificationStore.getState().addNotification({
                    id: `near-expiry-${item.id}-${Date.now()}`,
                    title: "Unit Near Expiry",
                    message: `New unit ${item.id.slice(0, 8)} (${item.bloodGroup}) is near expiry.`,
                    priority: "moderate"
                })
            } else if (item.status === 'expired') {
                useNotificationStore.getState().addNotification({
                    id: `expired-${item.id}-${Date.now()}`,
                    title: "Expired Unit Added",
                    message: `Unit ${item.id.slice(0, 8)} (${item.bloodGroup}) was added but is already expired.`,
                    priority: "critical"
                })
            }

            set((state) => ({
                items: [item, ...state.items],
            }))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add inventory item'
            set({ error: message })
            throw err
        }
    },

    updateItem: async (id, updatedFields) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/inventory/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFields),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to update inventory item')
            }

            const updated = mapRowToItem(json.data)

            set((state) => {
                const existing = state.items.find(i => i.id === id)

                // Notify on status transitions
                if (existing && existing.status !== 'near-expiry' && updated.status === 'near-expiry') {
                    useNotificationStore.getState().addNotification({
                        id: `near-expiry-${id}-${Date.now()}`,
                        title: "Unit Near Expiry",
                        message: `Unit ${id.slice(0, 8)} (${updated.bloodGroup}) is now near expiry.`,
                        priority: "moderate"
                    })
                } else if (existing && existing.status !== 'expired' && updated.status === 'expired') {
                    useNotificationStore.getState().addNotification({
                        id: `expired-${id}-${Date.now()}`,
                        title: "Unit Expired",
                        message: `Unit ${id.slice(0, 8)} (${updated.bloodGroup}) has expired.`,
                        priority: "critical"
                    })
                }

                return {
                    items: state.items.map((item) =>
                        item.id === id ? updated : item
                    ),
                }
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update inventory item'
            set({ error: message })
            throw err
        }
    },

    deleteItem: async (id) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/inventory/${id}`, {
                method: 'DELETE',
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to delete inventory item')
            }

            set((state) => ({
                items: state.items.filter((item) => item.id !== id),
            }))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete inventory item'
            set({ error: message })
            throw err
        }
    },

    reserveUnit: async (unitId, requestId) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/inventory/${unitId}/reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId }),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to reserve unit')
            }

            // Refresh to get updated status from server
            await get().fetchItems()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to reserve unit'
            set({ error: message })
            throw err
        }
    },

    releaseUnit: async (unitId) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/inventory/${unitId}/release`, {
                method: 'POST',
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to release unit')
            }

            // Refresh to get updated status from server
            await get().fetchItems()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to release unit'
            set({ error: message })
            throw err
        }
    },

    getLowStockGroups: (thresholdInput) => {
        const items = get().items
        const balances: Record<string, number> = {}
        const activeThreshold = thresholdInput ?? 10

        items.forEach(item => {
            if (item.status === 'available' || item.status === 'near-expiry') {
                balances[item.bloodGroup] = (balances[item.bloodGroup] || 0) + item.quantity
            }
        })

        return Object.entries(balances)
            .filter(([, qty]) => qty < activeThreshold)
            .map(([group, quantity]) => ({ group: group as BloodGroup, quantity }))
    },

    getNearExpiryUnits: () => {
        return get().items.filter(item => item.status === 'near-expiry')
    },

    getExpiredUnits: () => {
        return get().items.filter(item => item.status === 'expired')
    },

    subscribeRealtime: (organizationId) => {
        // Unsubscribe any existing channel first
        get().unsubscribeRealtime()

        const supabase = createClient()
        const channelName = `inventory_${organizationId}`

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inventory',
                    filter: `organization_id=eq.${organizationId}`,
                },
                () => {
                    // On any change, refresh the full list
                    get().fetchItems()
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
