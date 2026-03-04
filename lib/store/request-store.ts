import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BloodGroup, ComponentType } from './inventory-store'
import { RequestStatus, RequestUrgency, REQUEST_TRANSITIONS } from '@/types/request'
import { useNotificationStore } from './notification-store'

export type { RequestStatus, RequestUrgency }

export type ExtendedRequestStatus = RequestStatus | "escalated"

export type BloodRequest = {
    id: string
    hospitalId: string
    hospitalName: string
    bloodBankId?: string | null
    bloodGroup: BloodGroup
    componentType: ComponentType
    quantity: number // in units or ml
    urgency: RequestUrgency
    requiredDate: string
    status: RequestStatus
    requestDate: string
    overridden?: boolean
    overrideReason?: string
    overriddenAt?: number
    timeline: Array<{
        status: ExtendedRequestStatus
        timestamp: number
    }>
}

interface RequestState {
    requests: BloodRequest[]
    isLoading: boolean
    error: string | null
    filterStatus: RequestStatus | "All"
    filterUrgency: RequestUrgency | "All"
    fetchRequests: () => Promise<void>
    setFilterStatus: (status: RequestStatus | "All") => void
    setFilterUrgency: (urgency: RequestUrgency | "All") => void
    updateRequestStatus: (id: string, newStatus: RequestStatus) => void
    adminOverrideStatus: (requestId: string, newStatus: RequestStatus, reason: string) => void
    adminEscalateRequest: (requestId: string) => void
}

const mockNow = Date.now()

export const useRequestStore = create<RequestState>()(
    persist(
        (set, get) => ({
            requests: [
                {
                    id: "REQ-2024-001",
                    hospitalId: "HOSP-001",
                    hospitalName: "City General Hospital",
                    bloodBankId: "BANK-001",
                    bloodGroup: "O-",
                    componentType: "Packed RBC",
                    quantity: 5,
                    urgency: "critical",
                    requiredDate: "2024-02-20",
                    status: "sent",
                    requestDate: "2024-02-17",
                    timeline: [{ status: "sent", timestamp: mockNow - 86400000 }] // 1 day ago - stuck
                },
                {
                    id: "REQ-2024-002",
                    hospitalId: "HOSP-002",
                    hospitalName: "St. Mary's Medical Center",
                    bloodBankId: "BANK-001",
                    bloodGroup: "A+",
                    componentType: "Whole Blood",
                    quantity: 10,
                    urgency: "normal",
                    requiredDate: "2024-02-25",
                    status: "accepted",
                    requestDate: "2024-02-16",
                    timeline: [
                        { status: "sent", timestamp: mockNow - 172800000 },
                        { status: "accepted", timestamp: mockNow - 86400000 }
                    ]
                },
                {
                    id: "REQ-2024-003",
                    hospitalId: "HOSP-003",
                    hospitalName: "Community Health Clinic",
                    bloodBankId: "BANK-002",
                    bloodGroup: "AB-",
                    componentType: "Plasma",
                    quantity: 2,
                    urgency: "moderate",
                    requiredDate: "2024-02-18",
                    status: "sent",
                    requestDate: "2024-02-17",
                    timeline: [{ status: "sent", timestamp: mockNow - 86400000 }]
                },
                {
                    id: "REQ-2024-004",
                    hospitalId: "HOSP-004",
                    hospitalName: "Sunrise Trauma Center",
                    bloodBankId: "BANK-003",
                    bloodGroup: "B+",
                    componentType: "Platelets",
                    quantity: 6,
                    urgency: "critical",
                    requiredDate: "2024-02-17",
                    status: "sent",
                    requestDate: "2024-02-17",
                    timeline: [{ status: "sent", timestamp: mockNow - 200000 }] // 3 mins ago - not stuck yet
                },
                {
                    id: "REQ-2024-005",
                    hospitalId: "HOSP-005",
                    hospitalName: "Veterans Memorial",
                    bloodBankId: "BANK-002",
                    bloodGroup: "O+",
                    componentType: "Whole Blood",
                    quantity: 3,
                    urgency: "normal",
                    requiredDate: "2024-02-22",
                    status: "rejected",
                    requestDate: "2024-02-15",
                    timeline: [
                        { status: "sent", timestamp: mockNow - 259200000 },
                        { status: "rejected", timestamp: mockNow - 172800000 }
                    ]
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

            updateRequestStatus: (id, newStatus) => {
                const state = get();
                const req = state.requests.find(r => r.id === id);
                if (!req) return;

                const allowedTransitions = REQUEST_TRANSITIONS[req.status];
                if (!allowedTransitions.includes(newStatus)) {
                    console.warn(`Invalid transition from ${req.status} to ${newStatus}`);
                    return; // Return without state mutation
                }

                set((state) => ({
                    requests: state.requests.map((r) =>
                        r.id === id ? {
                            ...r,
                            status: newStatus,
                            timeline: [...(r.timeline || []), { status: newStatus, timestamp: Date.now() }]
                        } : r
                    )
                }))

                // Determine notification priority based on requested mappings
                let priority: "critical" | "moderate" | "normal" = "normal"
                if (newStatus === "accepted" || newStatus === "partially-accepted" || newStatus === "rejected") {
                    priority = "moderate"
                } else if (newStatus === "collected") {
                    priority = "normal"
                }

                useNotificationStore.getState().addNotification({
                    id: `status-update-${id}-${newStatus}-${Date.now()}`,
                    title: `Request ${newStatus.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
                    message: `Your blood request for ${req.bloodGroup} is now ${newStatus.replace('-', ' ')}.`,
                    priority
                })
            },

            adminOverrideStatus: (requestId, newStatus, reason) => {
                const state = get()
                const req = state.requests.find(r => r.id === requestId)
                if (!req) return

                set((state) => ({
                    requests: state.requests.map((r) =>
                        r.id === requestId ? {
                            ...r,
                            status: newStatus,
                            overridden: true,
                            overrideReason: reason,
                            overriddenAt: Date.now(),
                            timeline: [...(r.timeline || []), { status: newStatus, timestamp: Date.now() }]
                        } : r
                    )
                }))

                // Audit Log (Dynamic Import to avoid strict circular dep if any, though Zustand usually handles it)
                import('./audit-store').then(({ useAuditStore }) => {
                    useAuditStore.getState().addAuditEvent({
                        actorRole: "admin",
                        action: "OVERRIDE_REQUEST_STATUS",
                        targetId: requestId
                    })
                }).catch(console.error)

                useNotificationStore.getState().addNotification({
                    id: `admin-override-${requestId}-${Date.now()}`,
                    title: `Request Status Overridden`,
                    message: `Admin has overridden request ${requestId} to ${newStatus}.`,
                    priority: "moderate"
                })
            },

            adminEscalateRequest: (requestId) => {
                const state = get()
                const req = state.requests.find(r => r.id === requestId)
                if (!req || req.urgency !== "critical") return

                // Check if already escalated
                if (req.timeline.some(t => t.status === "escalated")) return

                set((state) => ({
                    requests: state.requests.map((r) =>
                        r.id === requestId ? {
                            ...r,
                            timeline: [...(r.timeline || []), { status: "escalated", timestamp: Date.now() }]
                        } : r
                    )
                }))

                import('./audit-store').then(({ useAuditStore }) => {
                    useAuditStore.getState().addAuditEvent({
                        actorRole: "admin",
                        action: "ESCALATE_REQUEST",
                        targetId: requestId
                    })
                }).catch(console.error)

                useNotificationStore.getState().addNotification({
                    id: `admin-escalate-${requestId}-${Date.now()}`,
                    title: `Emergency Escalation`,
                    message: `Request ${requestId} has been escalated by admin.`,
                    priority: "critical"
                })
            }
        }),
        {
            name: 'blood-request-storage',
        }
    )
)
