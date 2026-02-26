"use client"

import {
    LineChart,
    Line,
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
    ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/ui/kpi-card"
import { Clock, CheckCircle2, FileText } from "lucide-react"

// --- Mock Data ---

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
    { urgency: "Critical", timeHours: 1.5 },
    { urgency: "Urgent", timeHours: 4.2 },
    { urgency: "Normal", timeHours: 24.5 },
]

const bankReliabilityData = [
    { name: "Central Blood Bank", value: 45, color: "#22c55e" },
    { name: "City Red Cross", value: 30, color: "#3b82f6" },
    { name: "Metro Supply", value: 15, color: "#f59e0b" },
    { name: "Other Sources", value: 10, color: "#8b5cf6" },
]

export default function HospitalAnalyticsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                    Monitor your hospital&apos;s blood request supply chain metrics.
                </p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard
                    title="Avg. Fulfillment Time"
                    value="4.2 hrs"
                    icon={Clock}
                    trend={-12.5}
                    trendLabel="vs last month"
                />
                <KpiCard
                    title="Success Rate"
                    value="94.5%"
                    icon={CheckCircle2}
                    trend={2.1}
                    trendLabel="vs last month"
                />
                <KpiCard
                    title="Total Requests (Month)"
                    value="70"
                    icon={FileText}
                    trend={15.3}
                    trendLabel="vs last month"
                />
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Consumption (Line Chart) */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Monthly Blood Consumption</CardTitle>
                        <CardDescription>Requests generated vs units successfully fulfilled over 7 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={consumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="requests" name="Total Requests" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="fulfilled" name="Fulfilled Units" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Fulfillment Time (Bar Chart) */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Delivery Speed by Urgency</CardTitle>
                        <CardDescription>Average turnaround time in hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fulfillmentTimeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e5e5" />
                                    <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis dataKey="urgency" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={60} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5' }}
                                        formatter={(value) => [`${value} hrs`, 'Average Time']}
                                    />
                                    <Bar dataKey="timeHours" radius={[0, 4, 4, 0]} barSize={40}>
                                        {
                                            fulfillmentTimeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={
                                                    entry.urgency === 'Critical' ? '#ef4444' :
                                                        entry.urgency === 'Urgent' ? '#f59e0b' : '#3b82f6'
                                                } />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Blood Bank Reliability (Pie Chart) */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Supply Partners</CardTitle>
                        <CardDescription>Distribution of successfully fulfilled requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex justify-center mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={bankReliabilityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {bankReliabilityData.map((entry, index) => (
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
        </div>
    )
}
