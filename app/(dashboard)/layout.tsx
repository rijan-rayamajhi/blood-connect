import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { EmergencyAlert } from "@/components/dashboard/emergency-alert"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-muted/10">
                <EmergencyAlert />
                <Sidebar className="hidden md:flex" />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 sm:p-6 lg:p-8">
                        <div className="w-full max-w-screen-2xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
}
