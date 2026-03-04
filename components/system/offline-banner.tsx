"use client"

import { WifiOff } from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"

export function OfflineBanner() {
    const isOnline = useOnlineStatus()

    if (isOnline) return null

    return (
        <div
            className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-yellow-500 px-4 py-2 text-sm font-medium text-yellow-950"
            role="alert"
            aria-live="assertive"
        >
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            <span>You are offline. Some features may be unavailable.</span>
        </div>
    )
}
