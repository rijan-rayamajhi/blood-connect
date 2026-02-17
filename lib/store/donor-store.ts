import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BloodGroup } from './inventory-store'

export type DonorStatus = "Available" | "Ineligible" | "Temporary Deferral"

export type Donor = {
    id: string
    fullName: string
    bloodGroup: BloodGroup
    age: number
    lastDonationDate: string // YYYY-MM-DD
    totalDonations: number
    status: DonorStatus
    contactNumber: string
    email: string
}

interface DonorState {
    donors: Donor[]
    isLoading: boolean
    error: string | null
    fetchDonors: () => Promise<void>
    addDonor: (donor: Omit<Donor, 'id' | 'status' | 'totalDonations'>) => Promise<void>
    updateDonor: (id: string, donor: Partial<Donor>) => Promise<void>
    deleteDonor: (id: string) => Promise<void>
}

export const useDonorStore = create<DonorState>()(
    persist(
        (set) => ({
            donors: [
                {
                    id: "DON-001",
                    fullName: "John Doe",
                    bloodGroup: "O+",
                    age: 32,
                    lastDonationDate: "2023-11-15",
                    totalDonations: 5,
                    status: "Available",
                    contactNumber: "+1 (555) 123-4567",
                    email: "john.doe@example.com"
                },
                {
                    id: "DON-002",
                    fullName: "Jane Smith",
                    bloodGroup: "A-",
                    age: 28,
                    lastDonationDate: "2024-01-10",
                    totalDonations: 2,
                    status: "Temporary Deferral",
                    contactNumber: "+1 (555) 987-6543",
                    email: "jane.smith@example.com"
                },
                {
                    id: "DON-003",
                    fullName: "Robert Johnson",
                    bloodGroup: "B+",
                    age: 45,
                    lastDonationDate: "2023-08-20",
                    totalDonations: 12,
                    status: "Available",
                    contactNumber: "+1 (555) 456-7890",
                    email: "robert.j@example.com"
                },
                {
                    id: "DON-004",
                    fullName: "Emily Davis",
                    bloodGroup: "AB+",
                    age: 24,
                    lastDonationDate: "2024-02-01",
                    totalDonations: 1,
                    status: "Ineligible",
                    contactNumber: "+1 (555) 789-0123",
                    email: "emily.d@example.com"
                },
                {
                    id: "DON-005",
                    fullName: "Michael Wilson",
                    bloodGroup: "O-",
                    age: 35,
                    lastDonationDate: "2023-12-05",
                    totalDonations: 8,
                    status: "Available",
                    contactNumber: "+1 (555) 234-5678",
                    email: "michael.w@example.com"
                }

            ],
            isLoading: false,
            error: null,

            fetchDonors: async () => {
                set({ isLoading: true, error: null })
                try {
                    await new Promise(resolve => setTimeout(resolve, 800))
                    set({ isLoading: false })
                } catch {
                    set({ error: "Failed to fetch donors", isLoading: false })
                }
            },


            addDonor: async (newDonor) => {
                set({ isLoading: true, error: null })
                await new Promise(resolve => setTimeout(resolve, 600))

                set((state) => ({
                    donors: [
                        {
                            ...newDonor,
                            id: `DON-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                            status: "Available",
                            totalDonations: 0
                        },
                        ...state.donors
                    ],
                    isLoading: false
                }))
            },

            updateDonor: async (id, updatedDonor) => {
                set({ isLoading: true, error: null })
                await new Promise(resolve => setTimeout(resolve, 500))

                set((state) => ({
                    donors: state.donors.map((donor) =>
                        donor.id === id ? { ...donor, ...updatedDonor } : donor
                    ),
                    isLoading: false
                }))
            },

            deleteDonor: async (id) => {
                set({ isLoading: true, error: null })
                await new Promise(resolve => setTimeout(resolve, 500))

                set((state) => ({
                    donors: state.donors.filter((donor) => donor.id !== id),
                    isLoading: false
                }))
            },
        }),
        {
            name: 'blood-donor-storage',
        }
    )
)
