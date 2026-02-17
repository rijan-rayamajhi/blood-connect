"use client"

import { Button } from "@/components/ui/button"
import { useEmergencyStore } from "@/lib/store/emergency-store"
import { Siren } from "lucide-react"

export function Header() {
    const triggerAlert = useEmergencyStore((state) => state.triggerAlert)

    return (
        <header className="h-16 border-b bg-background flex items-center px-6 justify-between">
            <div className="font-semibold">Dashboard</div>
            <div className="flex items-center gap-4">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={triggerAlert}
                    className="font-bold animate-pulse"
                >
                    <Siren className="mr-2 h-4 w-4" />
                    Simulate Emergency
                </Button>
                <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
        </header>
    )
}
