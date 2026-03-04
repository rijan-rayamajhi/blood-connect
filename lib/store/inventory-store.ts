import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BloodUnit } from '@/types/inventory'
import { classifyUnitStatus } from '@/lib/utils/inventory-lifecycle'
import { useNotificationStore } from './notification-store'

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
    fetchItems: () => Promise<void>
    addItem: (item: Omit<InventoryItem, 'id' | 'status' | 'reservedForRequestId'>) => void
    updateItem: (id: string, item: Partial<InventoryItem>) => void
    deleteItem: (id: string) => void
    reserveUnit: (unitId: string, requestId: string) => void
    releaseUnit: (unitId: string) => void
    getLowStockGroups: (threshold?: number) => { group: BloodGroup; quantity: number }[]
    getNearExpiryUnits: () => InventoryItem[]
    getExpiredUnits: () => InventoryItem[]
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set, get) => ({
            items: [
                { id: "UNIT-2024-001", bloodGroup: "A+", componentType: "Whole Blood", quantity: 450, collectionDate: "2024-02-10", expiryDate: "2024-03-22", status: "available" },
                { id: "UNIT-2024-002", bloodGroup: "O-", componentType: "Packed RBC", quantity: 300, collectionDate: "2024-02-01", expiryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: "near-expiry" },
                { id: "UNIT-2024-003", bloodGroup: "AB+", componentType: "Platelets", quantity: 50, collectionDate: "2024-02-14", expiryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], status: "expired" },
                { id: "UNIT-2024-004", bloodGroup: "B-", componentType: "Plasma", quantity: 200, collectionDate: "2023-12-20", expiryDate: "2024-12-20", status: "reserved", reservedForRequestId: "REQ-2024-001" },
            ],
            isLoading: false,
            error: null,

            fetchItems: async () => {
                set({ isLoading: true, error: null })
                try {
                    await new Promise(resolve => setTimeout(resolve, 800))

                    // Reclassify existing units on load in case of expiry
                    const currentState = get();
                    const stateUpdated = currentState.items.map(unit => {
                        const nextStatus = classifyUnitStatus(unit)
                        return { ...unit, status: nextStatus }
                    })

                    set({ items: stateUpdated, isLoading: false })
                } catch {
                    set({ error: "Failed to fetch inventory", isLoading: false })
                }
            },

            addItem: (newItem) => {
                const id = `UNIT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
                const status = classifyUnitStatus(newItem as any)

                if (status === "near-expiry") {
                    useNotificationStore.getState().addNotification({
                        id: `near-expiry-${id}-${Date.now()}`,
                        title: "Unit Near Expiry",
                        message: `New unit ${id} (${newItem.bloodGroup}) is near expiry.`,
                        priority: "moderate"
                    })
                } else if (status === "expired") {
                    useNotificationStore.getState().addNotification({
                        id: `expired-${id}-${Date.now()}`,
                        title: "Expired Unit Added",
                        message: `Unit ${id} (${newItem.bloodGroup}) was added but is already expired.`,
                        priority: "critical"
                    })
                }

                set((state) => ({
                    items: [{ ...newItem, id, status, reservedForRequestId: null }, ...state.items]
                }))
            },

            updateItem: (id, updatedItem) => {
                set((state) => {
                    const existing = state.items.find(i => i.id === id)
                    if (!existing) return state

                    const merged = { ...existing, ...updatedItem }
                    const nextStatus = classifyUnitStatus(merged)

                    // Trigger alert if status transitioned to warning states
                    if (existing.status !== "near-expiry" && nextStatus === "near-expiry") {
                        useNotificationStore.getState().addNotification({
                            id: `near-expiry-${id}-${Date.now()}`,
                            title: "Unit Near Expiry",
                            message: `Unit ${id} (${merged.bloodGroup}) is now near expiry.`,
                            priority: "moderate"
                        })
                    } else if (existing.status !== "expired" && nextStatus === "expired") {
                        useNotificationStore.getState().addNotification({
                            id: `expired-${id}-${Date.now()}`,
                            title: "Unit Expired",
                            message: `Unit ${id} (${merged.bloodGroup}) has expired.`,
                            priority: "critical"
                        })
                    }

                    return {
                        items: state.items.map((item) =>
                            item.id === id ? { ...merged, status: nextStatus } : item
                        )
                    }
                })
            },

            deleteItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id)
                }))
            },

            reserveUnit: (unitId, requestId) => {
                const { items, updateItem } = get()
                const unit = items.find(u => u.id === unitId)

                if (unit && unit.status === "available") {
                    updateItem(unitId, { reservedForRequestId: requestId })
                }
            },

            releaseUnit: (unitId) => {
                const { updateItem } = get()
                updateItem(unitId, { reservedForRequestId: null })
            },

            getLowStockGroups: (thresholdInput) => {
                const items = get().items
                const balances: Record<string, number> = {}

                let activeThreshold = thresholdInput ?? 10
                if (thresholdInput === undefined) {
                    import('./system-config-store').then(({ useSystemConfigStore }) => {
                        activeThreshold = useSystemConfigStore.getState().config.lowStockThreshold
                    }).catch(() => { })
                }

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
                let hoursConfig = 48
                try {
                    const { useSystemConfigStore } = require('./system-config-store')
                    hoursConfig = useSystemConfigStore.getState().config.nearExpiryHours
                } catch (e) { }

                const now = Date.now()
                return get().items.filter(item => {
                    const expiry = new Date(item.expiryDate).getTime()
                    return item.status !== "expired" && expiry > now && (expiry - now) <= hoursConfig * 3600 * 1000
                })
            },

            getExpiredUnits: () => {
                return get().items.filter(item => item.status === "expired")
            }
        }),
        {
            name: 'blood-inventory-storage',
        }
    )
)
