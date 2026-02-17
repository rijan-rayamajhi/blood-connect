"use client"

import { motion } from "framer-motion"
import {
    LayoutDashboard,
    Hospital,
    Shield,
    CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const modules = [
    {
        title: "Blood Bank Portal",
        icon: LayoutDashboard,
        badge: "Core",
        features: [
            "Real-time Inventory Management",
            "Auto-Expiry Alerts",
            "Incoming Request Handling",
            "Donor Database & Tracking"
        ],
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    },
    {
        title: "Hospital Portal",
        icon: Hospital,
        badge: "Emergency",
        features: [
            "Nearby Blood Bank Discovery",
            "Emergency SOS Broadcast",
            "One-Click Pre-Booking",
            "Request Timeline Tracking"
        ],
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
    },
    {
        title: "Super Admin Portal",
        icon: Shield,
        badge: "Control",
        features: [
            "Organization Approvals",
            "System-Wide Health Monitoring",
            "Regional Analytics Dashboard",
            "SLA & Compliance Configuration"
        ],
        color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
    }
]

export function PlatformModules() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Comprehensive Platform Modules
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-lg">
                        Tailored interfaces for every stakeholder in the ecosystem.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {modules.map((module, index) => (
                        <motion.div
                            key={module.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full border-none shadow-md">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`p-2 rounded-lg ${module.color}`}>
                                            <module.icon className="h-6 w-6" />
                                        </div>
                                        <Badge variant="outline" className="font-normal">
                                            {module.badge}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl">{module.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {module.features.map((feature) => (
                                            <li key={feature} className="flex items-start text-sm text-muted-foreground">
                                                <CheckCircle2 className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
