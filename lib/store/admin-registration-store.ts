import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OrganizationRegistration, RegistrationStatus } from '@/types/registration'
import { useAuditStore } from './audit-store'
import { useAuthStore } from './auth-store'

interface AdminRegistrationState {
    registrations: OrganizationRegistration[]
    approveRegistration: (id: string) => void
    rejectRegistration: (id: string, remarks: string) => void
    suspendOrganization: (id: string) => void
    adminForceSuspend: (orgId: string, reason: string) => void
    addRegistration: (registration: OrganizationRegistration) => void
}

export const useAdminRegistrationStore = create<AdminRegistrationState>()(
    persist(
        (set, get) => ({
            registrations: [
                {
                    id: "ORG-001",
                    name: "City Central Clinic",
                    type: "hospital",
                    email: "admin@ccc.com",
                    documents: {
                        licenseUrl: "https://example.com/license1.pdf",
                    },
                    status: "pending",
                    submittedAt: Date.now() - 86400000 * 2,
                },
                {
                    id: "ORG-002",
                    name: "Global Blood Hub",
                    type: "blood-bank",
                    email: "contact@gbh.org",
                    documents: {
                        licenseUrl: "https://example.com/license2.pdf",
                        certificationUrl: "https://example.com/cert1.pdf",
                    },
                    status: "pending",
                    submittedAt: Date.now() - 86400000,
                }
            ],

            addRegistration: (registration) => set((state) => ({
                registrations: [registration, ...state.registrations]
            })),

            approveRegistration: (id) => {
                set((state) => ({
                    registrations: state.registrations.map(r =>
                        r.id === id ? { ...r, status: "approved", reviewedAt: Date.now() } : r
                    )
                }))
                useAuditStore.getState().addAuditEvent({
                    actorRole: "admin",
                    action: "APPROVE_REGISTRATION",
                    targetId: id
                })
            },

            rejectRegistration: (id, remarks) => {
                set((state) => ({
                    registrations: state.registrations.map(r =>
                        r.id === id ? { ...r, status: "rejected", reviewedAt: Date.now(), reviewRemarks: remarks } : r
                    )
                }))
                useAuditStore.getState().addAuditEvent({
                    actorRole: "admin",
                    action: "REJECT_REGISTRATION",
                    targetId: id
                })
            },

            suspendOrganization: (id) => {
                set((state) => ({
                    registrations: state.registrations.map(r =>
                        r.id === id ? { ...r, status: "suspended" } : r
                    )
                }))

                // Governance rule: trigger logout if matching ID
                const authState = useAuthStore.getState()
                if (authState.user?.id === id) {
                    authState.logoutSupabase()
                }

                useAuditStore.getState().addAuditEvent({
                    actorRole: "admin",
                    action: "SUSPEND_ORGANIZATION",
                    targetId: id
                })
            },

            adminForceSuspend: (orgId, reason) => {
                set((state) => ({
                    registrations: state.registrations.map(r =>
                        r.id === orgId ? { ...r, status: "suspended", reviewRemarks: reason, reviewedAt: Date.now() } : r
                    )
                }))

                const authState = useAuthStore.getState()
                if (authState.user?.id === orgId) {
                    authState.logoutSupabase()
                }

                useAuditStore.getState().addAuditEvent({
                    actorRole: "admin",
                    action: "FORCE_SUSPEND",
                    targetId: orgId
                })

                // Notification Store Dynamic Import
                import('./notification-store').then(({ useNotificationStore }) => {
                    useNotificationStore.getState().addNotification({
                        id: `force-suspend-${orgId}-${Date.now()}`,
                        title: `Organization Suspended`,
                        message: `Admin force-suspended organization ${orgId}.`,
                        priority: "moderate"
                    })
                }).catch(console.error)
            }
        }),
        {
            name: 'blood-registration-storage'
        }
    )
)
