import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { DashboardGuard } from "@/components/auth/dashboard-guard"
import { EmergencyAlert } from "@/components/dashboard/emergency-alert"
import { NotificationProvider } from "@/components/notification-provider"
import { SupabaseHydrationProvider } from "@/components/supabase-hydration-provider"
import { ErrorBoundary } from "@/components/system/error-boundary"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardGuard>
            <SupabaseHydrationProvider>
                <NotificationProvider>
                    <div className="flex h-screen overflow-hidden overflow-x-hidden bg-muted/10">
                        <EmergencyAlert />
                        <Sidebar className="hidden md:flex border-r" collapsible={true} />
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <Header />
                            <main id="main-content" className="flex-1 overflow-y-auto">
                                <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                    <ErrorBoundary>
                                        {children}
                                    </ErrorBoundary>
                                </div>
                            </main>
                        </div>
                    </div>
                </NotificationProvider>
            </SupabaseHydrationProvider>
        </DashboardGuard>
    )
}

