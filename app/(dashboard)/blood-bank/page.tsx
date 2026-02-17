"use client"

import {
    Activity,
    AlertTriangle,
    Droplets,
    FileText,
    Siren,
    Timer
} from "lucide-react"

import { KpiCard } from "@/components/ui/kpi-card"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Button } from "@/components/ui/button"
import { SosWidget } from "@/components/dashboard/sos-widget"
import { DashboardSkeleton } from "@/components/ui/skeletons"
import { EmptyState } from "@/components/ui/empty-state"
import dynamic from "next/dynamic"

// Dynamically import Recharts component to avoid SSR issues with React 19 / Next.js
// 'ssr: false' ensures it only renders on the client
const InventoryCharts = dynamic(() => import("@/components/dashboard/inventory-charts").then(mod => mod.InventoryCharts), {
    ssr: false,
    loading: () => <div className="h-[350px] w-full animate-pulse bg-muted rounded-xl" />
})
import { RecentActivity } from "@/components/dashboard/recent-activity"

import { useInventoryStore, InventoryItem } from "@/lib/store/inventory-store"

export default function BloodBankPage() {
    const { items, isLoading } = useInventoryStore()

    return (
        <BloodBankDashboardContent items={items} isLoading={isLoading} />
    )
}

function BloodBankDashboardContent({ items, isLoading }: { items: InventoryItem[], isLoading: boolean }) {
    // Calculate KPIs
    const totalUnits = items.length
    const lowStockThreshold = 10
    const lowStockCount = Object.values(items.reduce((acc, item) => {
        acc[item.group] = (acc[item.group] || 0) + 1
        return acc
    }, {} as Record<string, number>)).filter(count => count < lowStockThreshold).length

    const expiredCount = items.filter(item => new Date(item.expiryDate) < new Date()).length

    const kpis = [
        {
            title: "Total Units",
            value: totalUnits.toString(),
            icon: Droplets,
            trend: 12,
            trendLabel: "vs last month"
        },
        {
            title: "Low Stock Alerts",
            value: lowStockCount.toString(),
            icon: AlertTriangle,
            description: "Blood groups below threshold",
            trend: -2,
            trendLabel: "vs last week"
        },
        {
            title: "Expired Units",
            value: expiredCount.toString(),
            icon: Timer,
            trend: 5,
            trendLabel: "vs last month"
        },
        {
            title: "Pending Requests",
            value: "28",
            icon: FileText,
            description: "Requires immediate action",
            trend: 8,
            trendLabel: "new requests"
        }
    ]

    if (isLoading) {
        return <DashboardSkeleton />
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">Real-time overview of blood bank operations.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        Download Report
                    </Button>
                    <Button className="bg-critical hover:bg-critical/90 flex-1 md:flex-none" size="sm">
                        <Siren className="mr-2 h-4 w-4" />
                        Broadcast SOS
                    </Button>
                </div>
            </div>

            {/* Emergency SOS Section */}
            <SosWidget
                hospitalName="City Hospital"
                location="Downtown Medical Center, Block A"
                bloodGroup="O- Negative"
                units={5}
                timeElapsed="12m"
                targetDate={new Date(new Date().getTime() + 1000 * 60 * 45)} // 45 mins from now
            />

            {/* KPI Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {items.length === 0 ? (
                    <div className="col-span-full">
                        <AlertBanner
                            type="moderate"
                            title="Inventory Empty"
                            description="Your blood bank inventory is currently empty. Add items to see metrics."
                        />
                    </div>
                ) : (
                    kpis.map((kpi) => (
                        <KpiCard
                            key={kpi.title}
                            title={kpi.title}
                            value={kpi.value}
                            icon={kpi.icon}
                            trend={kpi.trend}
                            trendLabel={kpi.trendLabel}
                            description={kpi.description}
                        />
                    ))
                )}
            </div>

            {/* Charts and Activity Grid */}
            {items.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                    <InventoryCharts items={items} />
                    <RecentActivity />
                </div>
            ) : (
                <EmptyState
                    icon={Activity}
                    title="No Activity Data"
                    description="Charts and activity logs will appear here once you have inventory and request data."
                />
            )}

            {/* Alerts Section - Condensed */}
            {items.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                    <AlertBanner
                        type="critical"
                        title="Critical Stock Low"
                        description="O- (5 units) and B- (8 units) are below safety threshold."
                    />
                    <AlertBanner
                        type="moderate"
                        title="Approaching Expiry"
                        description="15 units of A+ platelets will expire in 24 hours."
                    />
                </div>
            )}
        </div>
    )
}
