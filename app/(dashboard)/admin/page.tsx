import { AdminDashboardClient } from "./admin-dashboard-client"
import { AdminAnalyticsSection } from "@/components/admin/admin-analytics-section"

export default function AdminPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of system status, alerts, and analytics.</p>
            </div>
            <AdminDashboardClient />
            <hr className="border-border" />
            <AdminAnalyticsSection />
        </div>
    )
}
