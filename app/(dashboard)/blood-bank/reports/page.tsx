"use client"

import {
    DemandTrendChart,
    UtilizationChart,
    ExpiryPieChart,
    HospitalDemandTable
} from "@/components/dashboard/reports/reports-charts"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/ui/kpi-card"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Calendar, Download, FileText, Percent, AlertTriangle, ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { useInventoryStore } from "@/lib/store/inventory-store"
import { useRequestStore } from "@/lib/store/request-store"

// ── Mock chart data ──────────────────────────────────────────────────────────

const demandTrendData = [
    { month: "Sep", "A+": 32, "B+": 28, "O+": 45, "AB+": 12, "O-": 18 },
    { month: "Oct", "A+": 38, "B+": 22, "O+": 50, "AB+": 15, "O-": 20 },
    { month: "Nov", "A+": 40, "B+": 30, "O+": 48, "AB+": 10, "O-": 25 },
    { month: "Dec", "A+": 35, "B+": 32, "O+": 55, "AB+": 18, "O-": 22 },
    { month: "Jan", "A+": 42, "B+": 35, "O+": 60, "AB+": 14, "O-": 28 },
    { month: "Feb", "A+": 44, "B+": 38, "O+": 52, "AB+": 16, "O-": 24 },
]

const expiryLossData = [
    { month: "Sep", expired: 3 },
    { month: "Oct", expired: 5 },
    { month: "Nov", expired: 2 },
    { month: "Dec", expired: 8 },
    { month: "Jan", expired: 4 },
    { month: "Feb", expired: 6 },
]

const CHART_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"]

export default function ReportsPage() {
    const items = useInventoryStore((s) => s.items)
    const requests = useRequestStore((s) => s.requests)

    // ── KPI: Utilization Rate ────────────────────────────────────────────────
    const totalCollected = items.length
    const availableUnits = items.filter(
        (i) => i.status === "available" || i.status === "near-expiry"
    ).length
    const utilizationRate =
        totalCollected > 0
            ? Math.round(((totalCollected - availableUnits) / totalCollected) * 100)
            : 0

    // ── KPI: Expiry Loss ─────────────────────────────────────────────────────
    const expiredUnits = items.filter((i) => i.status === "expired").length

    // ── Hospital-wise demand (from request store) ────────────────────────────

    // ── Export handlers ──────────────────────────────────────────────────────
    function handleExportCSV(reportType: 'inventory' | 'requests' | 'donors') {
        window.location.href = `/api/reports/${reportType}?format=csv`
    }

    function handleExportPDF() {
        // Mock PDF export
        const content = `BloodConnect Report - ${new Date().toISOString().split("T")[0]}\n\nTotal Units: ${totalCollected}\nUtilization: ${utilizationRate}%\nExpired: ${expiredUnits}\nTotal Requests: ${requests.length}`
        const blob = new Blob([content], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `bloodconnect-report-${new Date().toISOString().split("T")[0]}.pdf`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Performance metrics, demand analysis, and inventory health.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2" aria-label="Export CSV report">
                                <Download className="h-4 w-4" />
                                Export CSV
                                <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExportCSV('inventory')}>
                                Inventory Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportCSV('requests')}>
                                Requests Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportCSV('donors')}>
                                Donors Report
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF} aria-label="Export PDF report">
                        <FileText className="h-4 w-4" />
                        Export PDF
                    </Button>
                    <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 30 Days
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KpiCard
                    title="Total Inventory Units"
                    value={totalCollected}
                    icon={FileText}
                    description="Units currently in system"
                />
                <KpiCard
                    title="Utilization Rate"
                    value={`${utilizationRate}%`}
                    icon={Percent}
                    trend={utilizationRate > 50 ? 5.2 : -3.1}
                    trendLabel="vs last period"
                />
                <KpiCard
                    title="Expired Units"
                    value={expiredUnits}
                    icon={AlertTriangle}
                    description="Units lost to expiry"
                />
            </div>

            {/* Blood Group Demand Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Blood Group Demand Trend</CardTitle>
                    <CardDescription>Monthly request count per blood group</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={demandTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                {["A+", "B+", "O+", "AB+", "O-"].map((group, i) => (
                                    <Line
                                        key={group}
                                        type="monotone"
                                        dataKey={group}
                                        stroke={CHART_COLORS[i]}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        activeDot={{ r: 5 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Existing charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DemandTrendChart />
                <UtilizationChart />
                <ExpiryPieChart />

                {/* Expiry Loss Analysis - Bar chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Expiry Loss Analysis</CardTitle>
                        <CardDescription>Expired units per month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={expiryLossData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                    <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }} />
                                    <Bar dataKey="expired" name="Expired Units" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Hospital-wise Demand Table */}
            <HospitalDemandTable />
        </div>
    )
}
