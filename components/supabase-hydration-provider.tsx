"use client"

import { useEffect } from 'react'
import { useMasterDataStore } from '@/lib/store/master-data-store'
import { useSystemConfigStore } from '@/lib/store/system-config-store'
import { useRequestStore } from '@/lib/store/request-store'
import { useAuthStore } from '@/lib/store/auth-store'

/**
 * Hydrates Zustand stores from Supabase on mount.
 * Should be placed inside the dashboard layout so it runs once
 * when the authenticated app shell loads.
 */
export function SupabaseHydrationProvider({ children }: { children: React.ReactNode }) {
    const fetchMasterData = useMasterDataStore(state => state.fetchMasterData)
    const fetchConfig = useSystemConfigStore(state => state.fetchConfig)
    const fetchRequests = useRequestStore(state => state.fetchRequests)
    const subscribeRealtime = useRequestStore(state => state.subscribeRealtime)
    const unsubscribeRealtime = useRequestStore(state => state.unsubscribeRealtime)
    const user = useAuthStore(state => state.user)

    useEffect(() => {
        fetchMasterData()
        fetchConfig()

        if (user) {
            fetchRequests()
            // If admin, subscribe to all. If others, subscribe to their org context.
            subscribeRealtime(user.role === 'admin' ? undefined : (user.organizationId || undefined))
        }

        return () => {
            unsubscribeRealtime()
        }
    }, [fetchMasterData, fetchConfig, fetchRequests, subscribeRealtime, unsubscribeRealtime, user])

    return <>{children}</>
}
