"use client"

import { useState, useEffect, useCallback } from "react"

export function useOnlineStatus(): boolean {
    const [isOnline, setIsOnline] = useState(true)

    const handleOnline = useCallback(() => setIsOnline(true), [])
    const handleOffline = useCallback(() => setIsOnline(false), [])

    useEffect(() => {
        if (typeof window === "undefined") return

        if (navigator.onLine !== isOnline) {
            const timer = setTimeout(() => setIsOnline(navigator.onLine), 0)
            return () => clearTimeout(timer)
        }
        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [handleOnline, handleOffline, isOnline])

    return isOnline
}
