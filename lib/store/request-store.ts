import { create } from 'zustand'
import { BloodGroup, ComponentType } from './inventory-store'
import { RequestStatus, RequestUrgency } from '@/types/request'
import { useNotificationStore } from './notification-store'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type { RequestStatus, RequestUrgency }

export type ExtendedRequestStatus = RequestStatus | "escalated"

export type BloodRequest = {
    id: string
    hospitalId: string
    hospitalName: string
    bloodBankId?: string | null
    bloodGroup: BloodGroup
    componentType: ComponentType
    quantity: number
    urgency: RequestUrgency
    requiredDate: string
    status: RequestStatus
    requestDate: string
    prescriptionFileId?: string | null
    overridden?: boolean
    overrideReason?: string
    overriddenAt?: number
    timeline: {
        status: ExtendedRequestStatus
        timestamp: number
    }[]
}

interface RequestState {
    requests: BloodRequest[]
    isLoading: boolean
    error: string | null
    filterStatus: RequestStatus | "All"
    filterUrgency: RequestUrgency | "All"
    _realtimeChannel: RealtimeChannel | null

    // Core Actions
    fetchRequests: () => Promise<void>
    createRequest: (payload: {
        bloodGroup: BloodGroup
        componentType: ComponentType
        quantity: number
        urgency: RequestUrgency
        requiredDate: string
        prescriptionFileId?: string | null
        bloodBankId?: string | null
    }) => Promise<void>

    // Filters
    setFilterStatus: (status: RequestStatus | "All") => void
    setFilterUrgency: (urgency: RequestUrgency | "All") => void

    // Status Transitions
    updateRequestStatus: (id: string, newStatus: RequestStatus) => Promise<void>
    adminOverrideStatus: (requestId: string, newStatus: RequestStatus, reason: string) => Promise<void>
    adminEscalateRequest: (requestId: string) => Promise<void>

    // Realtime
    subscribeRealtime: (organizationId?: string) => void
    unsubscribeRealtime: () => void
}

export const useRequestStore = create<RequestState>()((set, get) => ({
    requests: [],
    isLoading: false,
    error: null,
    filterStatus: "All",
    filterUrgency: "All",
    _realtimeChannel: null,

    setFilterStatus: (status) => set({ filterStatus: status }),
    setFilterUrgency: (urgency) => set({ filterUrgency: urgency }),

    fetchRequests: async () => {
        set({ isLoading: true, error: null })
        try {
            const res = await fetch('/api/requests')
            const json = await res.json()
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to fetch requests')
            }
            set({ requests: json.data, isLoading: false })
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Failed to fetch requests", isLoading: false })
        }
    },

    createRequest: async (payload) => {
        set({ error: null })
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const json = await res.json()
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to create request')
            }

            // Assuming no Realtime active, add immediately for snappy UX or wait for realtime
            await get().fetchRequests()

            useNotificationStore.getState().addNotification({
                id: `request-created-${json.data.id}-${Date.now()}`,
                title: 'Request Sent',
                message: `Your blood request for ${payload.quantity} units of ${payload.bloodGroup} was sent successfully.`,
                priority: payload.urgency === 'critical' ? 'critical' : 'normal'
            })
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to create request"
            set({ error: errorMsg })
            throw new Error(errorMsg)
        }
    },

    updateRequestStatus: async (id, newStatus) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/requests/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to update request status')
            }

            await get().fetchRequests()

            let priority: "critical" | "moderate" | "normal" = "normal"
            if (newStatus === "accepted" || newStatus === "partially-accepted" || newStatus === "rejected") {
                priority = "moderate"
            } else if (newStatus === "collected") {
                priority = "normal"
            }

            // We fetch the updated request from state 
            const req = get().requests.find(r => r.id === id);

            useNotificationStore.getState().addNotification({
                id: `status-update-${id}-${newStatus}-${Date.now()}`,
                title: `Request ${newStatus.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
                message: `Blood request ${req?.bloodGroup ? 'for ' + req.bloodGroup : ''} is now ${newStatus.replace('-', ' ')}.`,
                priority
            })
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to update request status"
            set({ error: errorMsg })
            throw new Error(errorMsg)
        }
    },

    adminOverrideStatus: async (requestId, newStatus, reason) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/requests/${requestId}/override`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, reason }),
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to override request status')
            }

            await get().fetchRequests()

            useNotificationStore.getState().addNotification({
                id: `admin-override-${requestId}-${Date.now()}`,
                title: `Request Status Overridden`,
                message: `Admin has overridden request ${requestId.slice(0, 8)} to ${newStatus}.`,
                priority: "moderate"
            })

            import('./audit-store').then(({ useAuditStore }) => {
                useAuditStore.getState().addAuditEvent({
                    actorRole: "admin",
                    action: "OVERRIDE_REQUEST_STATUS",
                    targetId: requestId,
                    metadata: { newStatus, reason }
                })
            }).catch(console.error)

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to override request status"
            set({ error: errorMsg })
            throw new Error(errorMsg)
        }
    },

    adminEscalateRequest: async (requestId) => {
        set({ error: null })
        try {
            const res = await fetch(`/api/requests/${requestId}/escalate`, {
                method: 'POST',
            })
            const json = await res.json()

            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Failed to escalate request')
            }

            await get().fetchRequests()

            useNotificationStore.getState().addNotification({
                id: `admin-escalate-${requestId}-${Date.now()}`,
                title: `Emergency Escalation`,
                message: `Request ${requestId.slice(0, 8)} has been escalated by admin.`,
                priority: "critical"
            })

            import('./audit-store').then(({ useAuditStore }) => {
                useAuditStore.getState().addAuditEvent({
                    actorRole: "admin",
                    action: "ESCALATE_REQUEST",
                    targetId: requestId
                })
            }).catch(console.error)

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to escalate request"
            set({ error: errorMsg })
            throw new Error(errorMsg)
        }
    },

    subscribeRealtime: (organizationId) => {
        get().unsubscribeRealtime()

        const supabase = createClient()
        // organizationId could be hospital_id or blood_bank_id
        // If absent, assumes Admin subscribing to all.
        const channelName = organizationId ? `requests_${organizationId}` : `requests_all`

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'requests'
                },
                (payload) => {
                    // Quick optimization: Only fetch if event is relevant to us manually instead of fetching every single event
                    // If we have an organizationId, verify relevance
                    if (organizationId) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const rec = (payload.new || payload.old) as any;
                        if (rec && rec.hospital_id !== organizationId && rec.blood_bank_id !== organizationId && rec.blood_bank_id !== null) {
                            return; // Not relevant
                        }
                    }
                    get().fetchRequests()
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
    }
}))
