import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StaffRole = "Admin" | "Inventory Manager" | "Request Handler" | "Viewer"
export type StaffStatus = "Active" | "Offline"

export type Staff = {
    id: string
    name: string
    email: string
    role: StaffRole
    status: StaffStatus
    lastActive: string // ISO Date string
    phone: string
}

interface StaffState {
    staffList: Staff[]
    addStaff: (staff: Omit<Staff, 'id' | 'status' | 'lastActive'>) => void
    updateStaff: (id: string, staff: Partial<Staff>) => void
    deleteStaff: (id: string) => void
}

export const useStaffStore = create<StaffState>()(
    persist(
        (set) => ({
            staffList: [
                {
                    id: "STF-001",
                    name: "Dr. Sarah Connor",
                    email: "sarah.c@bloodconnect.com",
                    role: "Admin",
                    status: "Active",
                    lastActive: new Date().toISOString(),
                    phone: "+1 (555) 000-1111"
                },
                {
                    id: "STF-002",
                    name: "James Reese",
                    email: "james.r@bloodconnect.com",
                    role: "Inventory Manager",
                    status: "Active",
                    lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
                    phone: "+1 (555) 000-2222"
                },
                {
                    id: "STF-003",
                    name: "Ellen Ripley",
                    email: "ellen.r@bloodconnect.com",
                    role: "Request Handler",
                    status: "Offline",
                    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                    phone: "+1 (555) 000-3333"
                },
                {
                    id: "STF-004",
                    name: "John McClane",
                    email: "john.m@bloodconnect.com",
                    role: "Viewer",
                    status: "Offline",
                    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                    phone: "+1 (555) 000-4444"
                }

            ],
            addStaff: (newStaff) => set((state) => ({
                staffList: [
                    {
                        ...newStaff,
                        id: `STF-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                        status: "Offline",
                        lastActive: new Date().toISOString()
                    },
                    ...state.staffList
                ]
            })),
            updateStaff: (id, updatedStaff) => set((state) => ({
                staffList: state.staffList.map((staff) =>
                    staff.id === id ? { ...staff, ...updatedStaff } : staff
                )
            })),
            deleteStaff: (id) => set((state) => ({
                staffList: state.staffList.filter((staff) => staff.id !== id)
            })),
        }),
        {
            name: 'blood-staff-storage',
        }
    )
)
