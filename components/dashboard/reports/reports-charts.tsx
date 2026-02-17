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
    AreaChart,
    Area,
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
import { Badge } from "@/components/ui/badge"

// --- Mock Data ---

const demandTrendData = [
    { month: "Jan", requests: 65, fulfilled: 60 },
    { month: "Feb", requests: 59, fulfilled: 55 },
    { month: "Mar", requests: 80, fulfilled: 75 },
    { month: "Apr", requests: 81, fulfilled: 78 },
    { month: "May", requests: 56, fulfilled: 50 },
    { month: "Jun", requests: 55, fulfilled: 52 },
    { month: "Jul", requests: 90, fulfilled: 85 },
]

const utilizationData = [
    { group: "A+", collected: 120, issued: 110 },
    { group: "B+", collected: 98, issued: 90 },
    { group: "O+", collected: 150, issued: 145 },
    { group: "AB+", collected: 40, issued: 35 },
    { group: "A-", collected: 30, issued: 28 },
    { group: "O-", collected: 45, issued: 44 },
]

const expiryData = [
    { name: "Expired", value: 12, color: "#ef4444" },
    { name: "Damaged", value: 5, color: "#f97316" },
    { name: "Tested Positive", value: 8, color: "#eab308" },
    { name: "Hemolyzed", value: 3, color: "#64748b" },
]

const hospitalDemandData = [
    { id: "HOS-001", name: "City General Hospital", requests: 120, fulfilled: 115, rate: 95.8 },
    { id: "HOS-002", name: "St. Mary's Clinic", requests: 45, fulfilled: 45, rate: 100 },
    { id: "HOS-003", name: "Trauma Center West", requests: 200, fulfilled: 180, rate: 90.0 },
    { id: "HOS-004", name: "Community Health", requests: 30, fulfilled: 25, rate: 83.3 },
    { id: "HOS-005", name: "Veterans Memorial", requests: 85, fulfilled: 82, rate: 96.4 },
]

// --- Components ---

export function DemandTrendChart() {
    return (
        <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle>Blood Demand Trends</CardTitle>
                <CardDescription>Requests vs. Fulfillment over last 7 months</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={demandTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorFulfilled" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="requests" stroke="#ef4444" fillOpacity={1} fill="url(#colorRequests)" name="Requests" />
                            <Area type="monotone" dataKey="fulfilled" stroke="#22c55e" fillOpacity={1} fill="url(#colorFulfilled)" name="Fulfilled" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function UtilizationChart() {
    return (
        <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle>Utilization by Blood Group</CardTitle>
                <CardDescription>Collected Units vs. Issued Units</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={utilizationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                            <XAxis dataKey="group" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Collected" />
                            <Bar dataKey="issued" fill="#22c55e" radius={[4, 4, 0, 0]} name="Issued" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function ExpiryPieChart() {
    return (
        <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
                <CardTitle>Wastage Analysis</CardTitle>
                <CardDescription>Breakdown of discarded units</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={expiryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {expiryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export function HospitalDemandTable() {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Hospital Demand Analysis</CardTitle>
                <CardDescription>Top requesting hospitals and fulfillment rates</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hospital Name</TableHead>
                            <TableHead className="text-right">Total Requests</TableHead>
                            <TableHead className="text-right">Fulfilled</TableHead>
                            <TableHead className="text-right">Fulfillment Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hospitalDemandData.map((hospital) => (
                            <TableRow key={hospital.id}>
                                <TableCell className="font-medium">
                                    {hospital.name}
                                    <div className="text-xs text-muted-foreground">{hospital.id}</div>
                                </TableCell>
                                <TableCell className="text-right">{hospital.requests}</TableCell>
                                <TableCell className="text-right">{hospital.fulfilled}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={hospital.rate >= 95 ? "default" : hospital.rate >= 85 ? "secondary" : "destructive"}>
                                        {hospital.rate}%
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
