import { AdminMonitoringClient } from "./admin-monitoring-client"

export default function AdminMonitoringPage() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
                <p className="text-muted-foreground">Monitor real-time system activity, trace stuck requests, and track SLA breaches.</p>
            </div>

            <AdminMonitoringClient />
        </div>
    )
}
