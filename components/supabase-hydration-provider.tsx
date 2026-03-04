"use client"

import { useEffect } from 'react'
import { useMasterDataStore } from '@/lib/store/master-data-store'
import { useSystemConfigStore } from '@/lib/store/system-config-store'

/**
 * Hydrates Zustand stores from Supabase on mount.
 * Should be placed inside the dashboard layout so it runs once
 * when the authenticated app shell loads.
 *
 * Uses graceful degradation: if Supabase is unreachable,
 * stores keep their existing defaults (from localStorage or hardcoded).
 */
export function SupabaseHydrationProvider({ children }: { children: React.ReactNode }) {
    const fetchMasterData = useMasterDataStore(state => state.fetchMasterData)
    const fetchConfig = useSystemConfigStore(state => state.fetchConfig)

    useEffect(() => {
        fetchMasterData()
        fetchConfig()
    }, [fetchMasterData, fetchConfig])

    return <>{children}</>
}
