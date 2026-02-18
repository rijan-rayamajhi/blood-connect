import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-"
export type ComponentType = "Whole Blood" | "Packed RBC" | "Platelets" | "Plasma" | "Cryoprecipitate"
export type UnitStatus = "Available" | "Reserved" | "Expired" | "Quarantine" | "Discarded"

export type InventoryItem = {
    id: string
    group: BloodGroup
    component: ComponentType
    quantity: number
    collectionDate: string
    expiryDate: string
    status: UnitStatus
}

interface InventoryState {
    items: InventoryItem[]
    isLoading: boolean
    error: string | null
    fetchItems: () => Promise<void>
    addItem: (item: Omit<InventoryItem, 'id' | 'status'> & { status?: UnitStatus }) => Promise<void>
    updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>
    deleteItem: (id: string) => Promise<void>
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set) => ({
            items: [
                { id: "UNIT-2024-001", group: "A+", component: "Whole Blood", quantity: 450, collectionDate: "2024-02-10", expiryDate: "2024-03-22", status: "Available" },
                { id: "UNIT-2024-002", group: "O-", component: "Packed RBC", quantity: 300, collectionDate: "2024-02-01", expiryDate: "2024-03-15", status: "Reserved" },
                { id: "UNIT-2024-003", group: "AB+", component: "Platelets", quantity: 50, collectionDate: "2024-02-14", expiryDate: "2024-02-19", status: "Available" },
                { id: "UNIT-2024-004", group: "B-", component: "Plasma", quantity: 200, collectionDate: "2023-12-20", expiryDate: "2024-12-20", status: "Available" },
                { id: "UNIT-2024-005", group: "A+", component: "Whole Blood", quantity: 450, collectionDate: "2024-02-11", expiryDate: "2024-03-23", status: "Quarantine" },
            ],
            isLoading: false,
            error: null,

            fetchItems: async () => {
                set({ isLoading: true, error: null })
                try {
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 800))
                    // In a real app, we would fetch from API here. 
                    // For now, we utilize the persisted state or default items.
                    set({ isLoading: false })
                } catch {
                    set({ error: "Failed to fetch inventory", isLoading: false })
                }
            },

            addItem: async (newItem) => {
                set({ isLoading: true, error: null })
                await new Promise(resolve => setTimeout(resolve, 600))

                set((state) => ({
                    items: [
                        {
                            ...newItem,
                            id: `UNIT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                            status: newItem.status || "Available"
                        },
                        ...state.items
                    ],
                    isLoading: false
                }))
            },

            updateItem: async (id, updatedItem) => {
                set({ isLoading: true, error: null })
                await new Promise(resolve => setTimeout(resolve, 500))

                set((state) => ({
                    items: state.items.map((item) => item.id === id ? { ...item, ...updatedItem } : item),
                    isLoading: false
                }))
            },

            deleteItem: async (id) => {
                set({ isLoading: true, error: null })
                await new Promise(resolve => setTimeout(resolve, 500))

                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                    isLoading: false
                }))
            },
        }),
        {
            name: 'blood-inventory-storage',
        }
    )
)
