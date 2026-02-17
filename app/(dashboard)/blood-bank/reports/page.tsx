"use client"

import {
    DemandTrendChart,
    UtilizationChart,
    ExpiryPieChart,
    HospitalDemandTable
} from "@/components/dashboard/reports/reports-charts"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function ReportsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Performance metrics, demand analysis, and inventory health.
                    </p>
                </div>
                <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Last 30 Days
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DemandTrendChart />
                <UtilizationChart />
                <ExpiryPieChart />
                {/* Placeholder for potentially another chart or kpi summary in the future to balance grid if needed, 
                    or this row will have 1 item if grid breaks. 
                    Actually, Expiry is col-span-1. Let's make Hospital Table full width below.
                */}
            </div>

            <HospitalDemandTable />
        </div>
    )
}
