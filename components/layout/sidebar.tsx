"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useCreateRequestStore } from "@/lib/modal-store"
import { buttonVariants, Button } from "@/components/ui/button"
import { LayoutDashboard, Package, FileText, Settings, Activity, Users, ShieldCheck, BarChart3, Map, Calendar, User } from "lucide-react"

const bloodBankSidebarItems = [
    {
        title: "Dashboard",
        href: "/blood-bank",
        icon: LayoutDashboard,
    },
    {
        title: "Inventory",
        href: "/blood-bank/inventory",
        icon: Package,
    },
    {
        title: "Requests",
        href: "/blood-bank/requests",
        icon: FileText,
    },
    {
        title: "Donors",
        href: "/blood-bank/donors",
        icon: Users,
    },
    {
        title: "Staff",
        href: "/blood-bank/staff",
        icon: ShieldCheck,
    },
    {
        title: "Reports",
        href: "/blood-bank/reports",
        icon: BarChart3,
    },
    {
        title: "Profile",
        href: "/blood-bank/profile",
        icon: User,
    },
    {
        title: "Settings",
        href: "/blood-bank/settings",
        icon: Settings,
    },
]

const hospitalSidebarItems = [
    {
        title: "Dashboard",
        href: "/hospital",
        icon: LayoutDashboard,
    },
    {
        title: "Discovery",
        href: "/hospital/discovery",
        icon: Map,
    },
    {
        title: "Create Request",
        href: "#create-request",
        icon: FileText, // Using FileText or maybe PlusCircle
    },
    {
        title: "My Requests",
        href: "/hospital/requests",
        icon: FileText,
    },
    {
        title: "Pre-Booking",
        href: "/hospital/pre-booking",
        icon: Calendar,
    },
    {
        title: "Analytics",
        href: "/hospital/analytics",
        icon: BarChart3,
    },
    {
        title: "Profile",
        href: "/hospital/profile",
        icon: User,
    },
    {
        title: "Settings",
        href: "/hospital/settings",
        icon: Settings,
    },
]

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Sidebar({ className, collapsible = false }: { className?: string, collapsible?: boolean }) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { onOpen } = useCreateRequestStore()

    const isHospital = pathname?.startsWith("/hospital")
    const sidebarItems = isHospital ? hospitalSidebarItems : bloodBankSidebarItems

    return (
        <div
            className={cn(
                "border-r bg-card h-full flex flex-col transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64",
                className
            )}
        >
            <div className={cn("p-6 border-b flex items-center h-16", isCollapsed ? "justify-center px-4" : "justify-between")}>
                <Link href="/" className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                    <Activity className="h-6 w-6 text-critical shrink-0 animate-pulse" />
                    <span className={cn(
                        "text-xl font-bold tracking-tight text-foreground transition-all duration-300",
                        isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                    )}>
                        BloodConnect
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
                <nav className="px-3 space-y-2">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={(e) => {
                                if (item.href === "#create-request") {
                                    e.preventDefault()
                                    onOpen()
                                }
                            }}
                            title={isCollapsed ? item.title : undefined}
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                "w-full flex items-center",
                                isCollapsed ? "justify-center px-2" : "justify-start px-4",
                                pathname === item.href
                                    ? "bg-muted hover:bg-muted"
                                    : "hover:bg-muted/50",
                                "transition-all duration-200"
                            )}
                        >
                            <item.icon className={cn("h-4 w-4 shrink-0", isCollapsed ? "mr-0" : "mr-2")} />
                            <span className={cn(
                                "whitespace-nowrap transition-all duration-300",
                                isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                            )}>
                                {item.title}
                            </span>
                        </Link>
                    ))
                    }
                </nav>
            </div>

            <div className="p-4 border-t space-y-4">
                <div className={cn(
                    "bg-muted/50 rounded-lg transition-all duration-300 overflow-hidden",
                    isCollapsed ? "p-2 items-center flex justify-center" : "p-4"
                )}>
                    {!isCollapsed && (
                        <p className="text-xs font-medium text-muted-foreground mb-1 whitespace-nowrap">Status</p>
                    )}
                    <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className={cn(
                            "text-sm font-medium whitespace-nowrap transition-all duration-300",
                            isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                        )}>
                            Online
                        </span>
                    </div>
                </div>

                {collapsible && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
                        {!isCollapsed && "Collapse"}
                    </Button>
                )}
            </div>
        </div>
    )
}

