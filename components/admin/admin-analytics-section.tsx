"use client"

import * as React from "react"
import { KpiCard } from "@/components/ui/kpi-card"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Download, Zap, TrendingUp, BarChart3 } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { useRequestStore } from "@/lib/store/request-store"
import { useInventoryStore } from "@/lib/store/inventory-store"
import { useAdminAnalyticsStore } from "@/lib/store/admin-analytics-store"
import { exportToCSV, reportFilename } from "@/lib/utils/export-csv"

export function AdminAnalyticsSection() {
    const requests = useRequestStore((s) => s.requests)
    const items = useInventoryStore((s) => s.items)
    const { supplyDemand, fetchMetrics } = useAdminAnalyticsStore()

    React.useEffect(() => {
        fetchMetrics()
    }, [fetchMetrics])

    // Format for Recharts
    const chartData = supplyDemand.map((d: Record<string, unknown>) => ({
        region: d.blood_group as string,
        demand: (d.total_demand as number) || 0,
        supply: (d.total_supply as number) || 0
    }))

    // ── KPIs ──────────────────────────────────────────────────────────────
    const totalDemand = requests.length
    const totalSupply = items.filter(
        (i) => i.status === "available" || i.status === "near-expiry"
    ).length
    const demandSupplyRatio =
        totalSupply > 0 ? ((totalDemand / totalSupply) * 100).toFixed(0) : "N/A"

    // Emergency response: avg time for critical request acceptance (mock)
    const criticalRequests = requests.filter((r) => r.urgency === "critical")
    const avgResponseMinutes = criticalRequests.length > 0
        ? Math.round(
            criticalRequests.reduce((sum, r) => {
                const sent = r.timeline.find((t) => t.status === "sent")
                const accepted = r.timeline.find(
                    (t) => t.status === "accepted" || t.status === "partially-accepted"
                )
                if (sent && accepted) {
                    return sum + (accepted.timestamp - sent.timestamp) / 60000
                }
                return sum + 45 // fallback mock
            }, 0) / criticalRequests.length
        )
        : 0

    // ── Export handler ───────────────────────────────────────────────────
    function handleGovExport() {
        const rows = [
            {
                Metric: "Total Requests",
                Value: totalDemand,
            },
            {
                Metric: "Total Available Supply",
                Value: totalSupply,
            },
            {
                Metric: "Demand/Supply Ratio",
                Value: `${demandSupplyRatio}%`,
            },
            {
                Metric: "Critical Requests",
                Value: criticalRequests.length,
            },
            {
                Metric: "Avg Emergency Response (min)",
                Value: avgResponseMinutes,
            },
            ...chartData.map((d) => ({
                Metric: `${d.region} Demand`,
                Value: d.demand,
            })),
            ...chartData.map((d) => ({
                Metric: `${d.region} Supply`,
                Value: d.supply,
            })),
        ]
        exportToCSV(reportFilename("government-summary"), rows)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold">Global Analytics</h2>
                    <p className="text-sm text-muted-foreground">
                        System-wide demand, supply, and emergency metrics.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleGovExport}
                    aria-label="Export government summary CSV"
                >
                    <Download className="h-4 w-4" />
                    Government Export
                </Button>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard
                    title="Demand vs Supply"
                    value={`${demandSupplyRatio}%`}
                    icon={TrendingUp}
                    description="Request-to-supply ratio"
                />
                <KpiCard
                    title="Avg Emergency Response"
                    value={`${avgResponseMinutes} min`}
                    icon={Zap}
                    trend={avgResponseMinutes < 30 ? -8.5 : 5.2}
                    trendLabel="vs last period"
                />
                <KpiCard
                    title="Critical Requests"
                    value={criticalRequests.length}
                    icon={BarChart3}
                    description="Active critical requests"
                />
            </div>

            {/* Regional Demand vs Supply Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Blood Group Demand vs Supply</CardTitle>
                    <CardDescription>Comparison of total requests vs available inventory by blood group</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis dataKey="region" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar dataKey="demand" name="Demand" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="supply" name="Supply" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
