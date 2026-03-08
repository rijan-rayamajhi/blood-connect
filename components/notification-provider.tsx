"use client"

import React, { useEffect } from 'react'
import { useNotificationStore } from '@/lib/store/notification-store'
import { useNotificationSound } from '@/hooks/use-notification-sound'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/auth-store'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const activeSound = useNotificationStore(state => state.activeSound)
    const { isInitialized, fetchNotifications, addRealtimeNotification, updateRealtimeNotification, removeRealtimeNotification } = useNotificationStore()
    const user = useAuthStore(state => state.user)

    useNotificationSound(activeSound)

    useEffect(() => {
        if (!user || isInitialized) return
        fetchNotifications()
    }, [user, isInitialized, fetchNotifications])

    useEffect(() => {
        if (!user) return

        const supabase = createClient()

        // Since we use RLS, supabase might not filter unless we use RLS correctly on realtime.
        // We filter client-side in the postgres_changes handlers.

        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    // Check if it's for us
                    const row = payload.new
                    if (row.user_id === user.id || row.organization_id === user.organizationId || user.role === 'admin') {
                        addRealtimeNotification(row)
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'notifications' },
                (payload) => {
                    const row = payload.new
                    if (row.user_id === user.id || row.organization_id === user.organizationId || user.role === 'admin') {
                        updateRealtimeNotification(row.id, {
                            status: row.status
                        })
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'notifications' },
                (payload) => {
                    if (payload.old && payload.old.id) {
                        removeRealtimeNotification(payload.old.id)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, addRealtimeNotification, updateRealtimeNotification, removeRealtimeNotification])

    return <>{children}</>
}
