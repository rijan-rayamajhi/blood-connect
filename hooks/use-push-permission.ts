"use client"

import { useState, useCallback, useEffect } from "react"

type PushPermission = NotificationPermission | "unsupported"

interface UsePushPermissionReturn {
    permission: PushPermission
    requestPermission: () => Promise<void>
    isSupported: boolean
}

export function usePushPermission(): UsePushPermissionReturn {
    const [permission, setPermission] = useState<PushPermission>(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            return Notification.permission
        }
        return "unsupported"
    })

    const isSupported = permission !== "unsupported"

    // Sync if permission changes externally
    useEffect(() => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            if (permission !== "unsupported") {
                const timer = setTimeout(() => setPermission("unsupported"), 0)
                return () => clearTimeout(timer)
            }
            return
        }
        if (Notification.permission !== permission) {
            const timer = setTimeout(() => setPermission(Notification.permission), 0)
            return () => clearTimeout(timer)
        }
    }, [permission])

    const requestPermission = useCallback(async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            return
        }

        const result = await Notification.requestPermission()
        setPermission(result)
    }, [])

    return { permission, requestPermission, isSupported }
}
