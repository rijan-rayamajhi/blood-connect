"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEmergencyStore } from "@/lib/store/emergency-store"
import { useNotificationStore } from "@/lib/store/notification-store"
import { Siren } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import Link from "next/link"
import { NotificationCenter } from "@/components/layout/notification-center"

export function Header() {
    const pathname = usePathname()
    const triggerAlert = useEmergencyStore((state) => state.triggerAlert)
    const addNotification = useNotificationStore((state) => state.addNotification)

    const isHospital = pathname?.startsWith("/hospital")
    const title = isHospital ? "Hospital Portal" : "Blood Bank Portal"

    const handleEmergencySimulation = () => {
        // Legacy emergency store
        triggerAlert()

        // New scalable notification engine
        addNotification({
            id: `sos-${Date.now()}`,
            title: "Mass Casualty Event Reported",
            message: "Immediate Action Required: Dispatch Protocol Alpha-1",
            priority: "critical"
        })
    }

    return (
        <header className="h-16 border-b bg-background flex items-center px-6 justify-between">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <Sidebar className="w-full border-r-0" />
                    </SheetContent>
                </Sheet>
                <div className="font-semibold">{title}</div>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleEmergencySimulation}
                    className="font-bold animate-pulse"
                >
                    <Siren className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Simulate Emergency</span>
                    <span className="sm:hidden">SOS</span>
                </Button>

                <NotificationCenter />

                <Link href={isHospital ? "/hospital/profile" : "/blood-bank/profile"}>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Profile</span>
                    </Button>
                </Link>
            </div>
        </header>
    )
}
