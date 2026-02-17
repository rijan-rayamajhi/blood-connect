"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { LayoutDashboard, Package, FileText, Settings, Activity, Users, ShieldCheck, BarChart3 } from "lucide-react"

const sidebarItems = [
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
        title: "Settings",
        href: "/blood-bank/settings",
        icon: Settings,
    },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    return (
        <div className={cn("w-64 border-r bg-card h-full flex flex-col", className)}>
            <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-critical animate-pulse" />
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        BloodConnect
                    </span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                buttonVariants({ variant: "ghost" }),
                                "w-full justify-start",
                                pathname === item.href
                                    ? "bg-muted hover:bg-muted"
                                    : "hover:bg-muted/50",
                                "transition-colors"
                            )}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="p-4 border-t">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-medium">Online</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

