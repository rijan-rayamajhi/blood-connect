"use client"

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { Loader2 } from 'lucide-react'

export function AuthGate({ children }: { children: React.ReactNode }) {
    const [isReady, setIsReady] = useState(false)
    const initialize = useAuthStore(state => state.initialize)
    const sessionReady = useAuthStore(state => state.sessionReady)

    useEffect(() => {
        // Initialize Supabase session on mount
        initialize()
    }, [initialize])

    useEffect(() => {
        if (sessionReady) {
            setIsReady(true)
        }
    }, [sessionReady])

    if (!isReady) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return <>{children}</>
}
