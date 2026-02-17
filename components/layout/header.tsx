"use client"

import { Button } from "@/components/ui/button"
import { useEmergencyStore } from "@/lib/store/emergency-store"
import { Siren } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"

export function Header() {
    const triggerAlert = useEmergencyStore((state) => state.triggerAlert)

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
                <div className="font-semibold">Dashboard</div>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={triggerAlert}
                    className="font-bold animate-pulse"
                >
                    <Siren className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Simulate Emergency</span>
                    <span className="sm:hidden">SOS</span>
                </Button>
                <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
        </header>
    )
}
