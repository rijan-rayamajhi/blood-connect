"use client"

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { Loader2 } from 'lucide-react'

export function AuthGate({ children }: { children: React.ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false)
    const [isChecking, setIsChecking] = useState(true)
    const checkLockAndSession = useAuthStore(state => state.checkLockAndSession)

    useEffect(() => {
        const unsubHydrate = useAuthStore.persist.onFinishHydration(() => {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsHydrated(true)
        })

        if (useAuthStore.persist.hasHydrated()) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsHydrated(true)
        }

        return () => {
            if (unsubHydrate) {
                unsubHydrate()
            }
        }
    }, [])

    useEffect(() => {
        if (isHydrated) {
            checkLockAndSession()
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsChecking(false)
        }
    }, [isHydrated, checkLockAndSession])

    if (!isHydrated || isChecking) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return <>{children}</>
}
