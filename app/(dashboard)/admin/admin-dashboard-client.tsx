"use client"

import * as React from "react"
import { useAdminMetrics } from "@/lib/store/admin-selectors"
import { useAdminAnalyticsStore } from "@/lib/store/admin-analytics-store"
import { KpiCard } from "@/components/ui/kpi-card"
import { Activity, AlertTriangle, Building, Clock, Users } from "lucide-react"

export function AdminDashboardClient() {
    const metrics = useAdminMetrics()
    const { fetchMetrics } = useAdminAnalyticsStore()

    React.useEffect(() => {
        fetchMetrics()
    }, [fetchMetrics])

    const getHealthColor = (score: number) => {
        if (score >= 80) return "text-green-500"
        if (score >= 50) return "text-yellow-500"
        return "text-red-500"
    }

    const healthColor = getHealthColor(metrics.systemHealthScore)
    const healthBorderColor = metrics.systemHealthScore >= 80 ? 'border-l-green-500'
        : metrics.systemHealthScore >= 50 ? 'border-l-yellow-500'
            : 'border-l-red-500'

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <KpiCard
                    title="Total Blood Banks"
                    value={metrics.totalBloodBanks}
                    icon={Building}
                />
                <KpiCard
                    title="Total Hospitals"
                    value={metrics.totalHospitals}
                    icon={Building}
                />
                <KpiCard
                    title="Active Users"
                    value={metrics.activeUsers}
                    icon={Users}
                />
                <KpiCard
                    title="Emergency Requests"
                    value={metrics.activeEmergencyRequests}
                    icon={AlertTriangle}
                />
                <KpiCard
                    title="System Health"
                    value={`${metrics.systemHealthScore}%`}
                    icon={Activity}
                    className={`border-l-4 ${healthBorderColor}`}
                />
            </div>

            <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">System Health Indicator:</span>
                <span className={`font-bold text-sm ${healthColor} flex items-center`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${metrics.systemHealthScore >= 80 ? 'bg-green-500' : metrics.systemHealthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    {metrics.systemHealthScore >= 80 ? "Green (Optimal)" : metrics.systemHealthScore >= 50 ? "Yellow (Warning)" : "Red (Critical)"}
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 pb-2">
                        <h3 className="font-semibold leading-none tracking-tight">Recent Request Status Updates</h3>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        {metrics.recentRequests.map(req => {
                            const lastEvent = req.timeline?.[req.timeline.length - 1]
                            return (
                                <div key={req.id} className="flex items-center gap-4 border-b pb-2 last:border-0">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{req.hospitalName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {req.bloodGroup} {req.componentType} - <span className="capitalize">{lastEvent?.status || req.status}</span>
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {lastEvent?.timestamp ? new Date(lastEvent.timestamp).toLocaleTimeString() : 'Unknown'}
                                    </div>
                                </div>
                            )
                        })}
                        {metrics.recentRequests.length === 0 && <p className="text-sm text-muted-foreground">No recent requests.</p>}
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 pb-2">
                        <h3 className="font-semibold leading-none tracking-tight">Recent Inventory Lifecycle Events</h3>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        {metrics.recentInventoryEvents.map(notif => (
                            <div key={notif.id} className="flex flex-col gap-1 border-b pb-2 last:border-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">{notif.title}</p>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(notif.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{notif.message}</p>
                            </div>
                        ))}
                        {metrics.recentInventoryEvents.length === 0 && <p className="text-sm text-muted-foreground">No recent events.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}
