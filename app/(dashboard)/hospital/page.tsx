import { Metadata } from "next"
import { KpiCard } from "@/components/ui/kpi-card"
import { Activity, Building2, Droplet, MapPin, Clock, ArrowRight, AlertTriangle, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"

export const metadata: Metadata = {
    title: "Hospital Dashboard | BloodConnect",
    description: "Manage blood requests and view availability.",
}

export default function HospitalDashboardPage() {
    return (
        <div className="flex flex-col gap-6 md:gap-8">
            {/* 1. Availability Summary */}
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold tracking-tight">Availability Summary</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <KpiCard
                        title="Total Nearby Blood Banks"
                        value="12"
                        icon={Building2}
                        description="Within 10km radius"
                        trend={2}
                        trendLabel="New this month"
                    />
                    <KpiCard
                        title="Total Available Units"
                        value="2,450"
                        icon={Droplet}
                        description="Across all groups"
                        trend={-5}
                        trendLabel="Since yesterday"
                    />
                    <KpiCard
                        title="Active Requests"
                        value="5"
                        icon={Activity}
                        description="2 Critical, 3 Normal"
                        trend={1}
                        trendLabel="Since last hour"
                    />
                </div>
            </section>

            {/* 2. Nearby Blood Banks */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Nearby Blood Banks</h2>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            name: "City Central Blood Bank",
                            distance: "2.5 km",
                            time: "15 mins",
                            groups: ["A+", "B+", "O+", "AB-"],
                            variant: "default"
                        },
                        {
                            name: "St. Mary's Hospital Bank",
                            distance: "4.8 km",
                            time: "25 mins",
                            groups: ["O+", "O-", "A-"],
                            variant: "secondary"
                        },
                        {
                            name: "Red Cross Regional Center",
                            distance: "8.2 km",
                            time: "40 mins",
                            groups: ["AB+", "B-", "A+"],
                            variant: "outline"
                        }
                    ].map((bank, i) => (
                        <Card key={i} className="flex flex-col">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">{bank.name}</CardTitle>
                                        <CardDescription className="flex items-center text-xs">
                                            <MapPin className="mr-1 h-3 w-3" /> {bank.distance}
                                            <span className="mx-2">•</span>
                                            <Clock className="mr-1 h-3 w-3" /> {bank.time}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2 flex-1">
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {bank.groups.map(group => (
                                        <Badge key={group} variant="secondary" className="text-xs font-normal">
                                            {group}
                                        </Badge>
                                    ))}
                                    <Badge variant="outline" className="text-xs font-normal">+2 more</Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button size="sm" className="w-full" variant="outline">
                                    View Details
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    <Button variant="outline" size="sm" className="md:hidden w-full mt-2">
                        View All Nearby Banks
                    </Button>
                </div>
            </section>

            {/* 3. Active Requests */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Active Requests</h2>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            id: "REQ-2024-001",
                            bloodGroup: "O+",
                            units: 2,
                            component: "RBC",
                            status: "critical",
                            date: "Needed by 14:00 Today",
                            hospital: "City Hospital"
                        },
                        {
                            id: "REQ-2024-002",
                            bloodGroup: "A-",
                            units: 5,
                            component: "Platelets",
                            status: "active",
                            date: "Needed by 18:30 Today",
                            hospital: "St. Mary's"
                        },
                        {
                            id: "REQ-2024-003",
                            bloodGroup: "AB+",
                            units: 1,
                            component: "Plasma",
                            status: "pending",
                            date: "Scheduled for Tomorrow",
                            hospital: "General Hospital"
                        }
                    ].map((req, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base font-bold">{req.bloodGroup}</CardTitle>
                                        <CardDescription>{req.component} • {req.units} Units</CardDescription>
                                    </div>
                                    <StatusBadge status={req.status}>{req.status}</StatusBadge>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="mr-2 h-4 w-4" />
                                    {req.date}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button size="sm" variant="ghost" className="w-full justify-between">
                                    Track Status
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    <Button variant="outline" size="sm" className="md:hidden w-full mt-2">
                        View All Requests
                    </Button>
                </div>
            </section>

            {/* 4. Emergency Requests */}
            <section className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold tracking-tight text-destructive flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 animate-pulse" />
                    Emergency Requests
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {[
                        {
                            id: "EMG-2024-999",
                            bloodGroup: "O-",
                            units: 4,
                            component: "RBC",
                            status: "CRITICAL",
                            timeLeft: "15 mins left",
                            hospital: "General Hospital"
                        },
                        {
                            id: "EMG-2024-998",
                            bloodGroup: "AB-",
                            units: 2,
                            component: "Plasma",
                            status: "CRITICAL",
                            timeLeft: "45 mins left",
                            hospital: "General Hospital"
                        }
                    ].map((req, i) => (
                        <Card key={i} className="border-destructive/50 bg-destructive/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                                </span>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                                            {req.bloodGroup}
                                            <Badge variant="destructive" className="animate-pulse">CRITICAL</Badge>
                                        </CardTitle>
                                        <CardDescription className="text-destructive/80 font-medium">
                                            {req.component} • {req.units} Units
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="text-sm font-semibold text-destructive flex items-center">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Needed Immediately ({req.timeLeft})
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button size="sm" variant="destructive" className="w-full">
                                    View Tracking
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>

            {/* 5. Upcoming Pre-Bookings */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Upcoming Pre-Bookings</h2>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        View Schedule
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            id: "SCH-2024-101",
                            bloodGroup: "B+",
                            units: 3,
                            component: "Whole Blood",
                            status: "confirmed",
                            date: "Oct 20, 2024 • 09:00 AM",
                            procedure: "Elective Surgery"
                        },
                        {
                            id: "SCH-2024-102",
                            bloodGroup: "O-",
                            units: 2,
                            component: "RBC",
                            status: "pending",
                            date: "Oct 22, 2024 • 14:00 PM",
                            procedure: "Transplant"
                        },
                        {
                            id: "SCH-2024-103",
                            bloodGroup: "A+",
                            units: 1,
                            component: "Platelets",
                            status: "processing",
                            date: "Oct 25, 2024 • 10:30 AM",
                            procedure: "Chemotherapy"
                        }
                    ].map((booking, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base font-bold">{booking.bloodGroup}</CardTitle>
                                        <CardDescription>{booking.component} • {booking.units} Units</CardDescription>
                                    </div>
                                    <StatusBadge status={booking.status === "confirmed" ? "success" : booking.status === "processing" ? "moderate" : "neutral"}>
                                        {booking.status}
                                    </StatusBadge>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium flex items-center">
                                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {booking.date}
                                    </div>
                                    <div className="text-xs text-muted-foreground pl-6">
                                        For: {booking.procedure}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button size="sm" variant="outline" className="w-full">
                                    Manage
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                    <Button variant="outline" size="sm" className="md:hidden w-full mt-2">
                        View Full Schedule
                    </Button>
                </div>
            </section>
        </div>
    )
}
