import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BloodGroup, ComponentType } from './inventory-store'

export type RequestStatus = "Pending" | "Accepted" | "Rejected" | "Partial" | "Completed"
export type UrgencyLevel = "Critical" | "Urgent" | "Normal"

export type BloodRequest = {
    id: string
    hospitalName: string
    bloodGroup: BloodGroup
    componentType: ComponentType
    quantity: number // in units or ml
    urgency: UrgencyLevel
    requiredDate: string
    status: RequestStatus
    requestDate: string
}

interface RequestState {
    requests: BloodRequest[]
    isLoading: boolean
    error: string | null
    filterStatus: RequestStatus | "All"
    filterUrgency: UrgencyLevel | "All"
    fetchRequests: () => Promise<void>
    setFilterStatus: (status: RequestStatus | "All") => void
    setFilterUrgency: (urgency: UrgencyLevel | "All") => void
    updateRequestStatus: (id: string, status: RequestStatus) => Promise<void>
}

export const useRequestStore = create<RequestState>()(
    persist(
        (set) => ({
            requests: [
                {
                    id: "REQ-2024-001",
                    hospitalName: "City General Hospital",
                    bloodGroup: "O-",
                    componentType: "Packed RBC",
                    quantity: 5,
                    urgency: "Critical",
                    requiredDate: "2024-02-20",
                    status: "Pending",
                    requestDate: "2024-02-17"
                },
                {
                    id: "REQ-2024-002",
                    hospitalName: "St. Mary's Medical Center",
                    bloodGroup: "A+",
                    componentType: "Whole Blood",
                    quantity: 10,
                    urgency: "Normal",
                    requiredDate: "2024-02-25",
                    status: "Accepted",
                    requestDate: "2024-02-16"
                },
                {
                    id: "REQ-2024-003",
                    hospitalName: "Community Health Clinic",
                    bloodGroup: "AB-",
                    componentType: "Plasma",
                    quantity: 2,
                    urgency: "Urgent",
                    requiredDate: "2024-02-18",
                    status: "Pending",
                    requestDate: "2024-02-17"
                },
                {
                    id: "REQ-2024-004",
                    hospitalName: "Sunrise Trauma Center",
                    bloodGroup: "B+",
                    componentType: "Platelets",
                    quantity: 6,
                    urgency: "Critical",
                    requiredDate: "2024-02-17",
                    status: "Pending",
                    requestDate: "2024-02-17"
                },
                {
                    id: "REQ-2024-005",
                    hospitalName: "Veterans Memorial",
                    bloodGroup: "O+",
                    componentType: "Whole Blood",
                    quantity: 3,
                    urgency: "Normal",
                    requiredDate: "2024-02-22",
                    status: "Rejected",
                    requestDate: "2024-02-15"
                }
            ],
            isLoading: false,
            error: null,
            filterStatus: "All",
            filterUrgency: "All",

            setFilterStatus: (status) => set({ filterStatus: status }),
            setFilterUrgency: (urgency) => set({ filterUrgency: urgency }),

            fetchRequests: async () => {
                set({ isLoading: true, error: null })
                try {
                    await new Promise(resolve => setTimeout(resolve, 800))
                    set({ isLoading: false })
                } catch {
                    set({ error: "Failed to fetch requests", isLoading: false })
                }
            },

            updateRequestStatus: async (id, status) => {
                set({ isLoading: true, error: null })
                await new Promise(resolve => setTimeout(resolve, 600))

                set((state) => ({
                    requests: state.requests.map((req) =>
                        req.id === id ? { ...req, status } : req
                    ),
                    isLoading: false
                }))
            },
        }),
        {
            name: 'blood-request-storage',
        }
    )
)
