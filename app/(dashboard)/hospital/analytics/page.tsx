"use client"

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { KpiCard } from "@/components/ui/kpi-card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle2, FileText, Download } from "lucide-react"
import { exportToCSV, reportFilename } from "@/lib/utils/export-csv"

// ── Mock Data ────────────────────────────────────────────────────────────────

const consumptionData = [
    { month: "Jan", requests: 45, fulfilled: 42 },
    { month: "Feb", requests: 52, fulfilled: 48 },
    { month: "Mar", requests: 38, fulfilled: 35 },
    { month: "Apr", requests: 65, fulfilled: 60 },
    { month: "May", requests: 48, fulfilled: 45 },
    { month: "Jun", requests: 55, fulfilled: 50 },
    { month: "Jul", requests: 70, fulfilled: 68 },
]

const fulfillmentTimeData = [
    { urgency: "Critical", timeMinutes: 90 },
    { urgency: "Moderate", timeMinutes: 252 },
    { urgency: "Normal", timeMinutes: 1470 },
]

const bankReliabilityData = [
    { name: "City Central Blood Bank", fulfilled: 120, total: 125, rate: 96.0, color: "#22c55e" },
    { name: "Red Cross Society", fulfilled: 85, total: 95, rate: 89.5, color: "#3b82f6" },
    { name: "St. Mary's Hospital", fulfilled: 40, total: 50, rate: 80.0, color: "#f59e0b" },
    { name: "Community Health Center", fulfilled: 22, total: 30, rate: 73.3, color: "#8b5cf6" },
]

const supplyPartnerData = [
    { name: "Central Blood Bank", value: 45, color: "#22c55e" },
    { name: "City Red Cross", value: 30, color: "#3b82f6" },
    { name: "Metro Supply", value: 15, color: "#f59e0b" },
    { name: "Other Sources", value: 10, color: "#8b5cf6" },
]

// ── Computed KPIs ────────────────────────────────────────────────────────────

const avgFulfillmentMinutes = Math.round(
    fulfillmentTimeData.reduce((sum, d) => sum + d.timeMinutes, 0) / fulfillmentTimeData.length
)

const totalRequests = consumptionData.reduce((s, d) => s + d.requests, 0)
const totalFulfilled = consumptionData.reduce((s, d) => s + d.fulfilled, 0)
const successRate = totalRequests > 0 ? ((totalFulfilled / totalRequests) * 100).toFixed(1) : "0"
const latestMonthRequests = consumptionData[consumptionData.length - 1]?.requests ?? 0

// ── Component ────────────────────────────────────────────────────────────────

export default function HospitalAnalyticsPage() {
    function handleExportCSV() {
        const rows = consumptionData.map((d) => ({
            Month: d.month,
            Requests: d.requests,
            Fulfilled: d.fulfilled,
            Rate: totalRequests > 0 ? ((d.fulfilled / d.requests) * 100).toFixed(1) + "%" : "0%",
        }))
        exportToCSV(reportFilename("hospital-analytics"), rows)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor your hospital&apos;s blood request supply chain metrics.
                    </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV} aria-label="Export analytics CSV">
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard
                    title="Avg. Fulfillment Time"
                    value={`${avgFulfillmentMinutes} min`}
                    icon={Clock}
                    trend={-12.5}
                    trendLabel="vs last month"
                />
                <KpiCard
                    title="Success Rate"
                    value={`${successRate}%`}
                    icon={CheckCircle2}
                    trend={2.1}
                    trendLabel="vs last month"
                />
                <KpiCard
                    title="Total Requests (Month)"
                    value={latestMonthRequests}
                    icon={FileText}
                    trend={15.3}
                    trendLabel="vs last month"
                />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Consumption (Bar Chart) */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Monthly Blood Consumption</CardTitle>
                        <CardDescription>Units requested vs units successfully fulfilled</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={consumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                    <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Bar dataKey="requests" name="Total Requests" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="fulfilled" name="Fulfilled Units" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Fulfillment Time (Horizontal Bar Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Speed by Urgency</CardTitle>
                        <CardDescription>Average turnaround time in minutes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fulfillmentTimeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#e5e5e5" />
                                    <XAxis type="number" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="urgency" type="category" stroke="#888" fontSize={12} tickLine={false} axisLine={false} width={70} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                        formatter={(value) => [`${value} min`, 'Average Time']}
                                    />
                                    <Bar dataKey="timeMinutes" radius={[0, 4, 4, 0]} barSize={40}>
                                        {fulfillmentTimeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.urgency === 'Critical' ? '#ef4444' :
                                                    entry.urgency === 'Moderate' ? '#f59e0b' : '#3b82f6'
                                            } />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Blood Bank Reliability (Pie Chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Supply Partners</CardTitle>
                        <CardDescription>Distribution of successfully fulfilled requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex justify-center mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={supplyPartnerData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {supplyPartnerData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                        formatter={(value) => [`${value}%`, 'Share']}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Blood Bank Reliability Ranking */}
            <Card>
                <CardHeader>
                    <CardTitle>Blood Bank Reliability Ranking</CardTitle>
                    <CardDescription>Ranked by fulfillment success rate</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead scope="col" className="w-12">#</TableHead>
                                    <TableHead scope="col">Blood Bank</TableHead>
                                    <TableHead scope="col" className="text-right">Fulfilled</TableHead>
                                    <TableHead scope="col" className="text-right">Total</TableHead>
                                    <TableHead scope="col" className="text-right">Success Rate</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bankReliabilityData
                                    .sort((a, b) => b.rate - a.rate)
                                    .map((bank, i) => (
                                        <TableRow key={bank.name}>
                                            <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                                            <TableCell className="font-medium">{bank.name}</TableCell>
                                            <TableCell className="text-right">{bank.fulfilled}</TableCell>
                                            <TableCell className="text-right">{bank.total}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={
                                                    bank.rate >= 90 ? "text-green-600 font-semibold" :
                                                        bank.rate >= 75 ? "text-yellow-600 font-semibold" :
                                                            "text-red-600 font-semibold"
                                                }>
                                                    {bank.rate}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
