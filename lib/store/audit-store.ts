import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuditEvent {
    id: string
    actorRole: "admin"
    action: string
    targetId: string
    timestamp: number
    metadata?: Record<string, unknown>
}

interface AuditState {
    events: AuditEvent[]
    addAuditEvent: (event: Omit<AuditEvent, 'id' | 'timestamp'>) => void
}

export const useAuditStore = create<AuditState>()(
    persist(
        (set) => ({
            events: [],
            addAuditEvent: (event) => set((state) => ({
                events: [
                    {
                        ...event,
                        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        timestamp: Date.now()
                    },
                    ...state.events
                ]
            }))
        }),
        {
            name: 'blood-connect-audit'
        }
    )
)
