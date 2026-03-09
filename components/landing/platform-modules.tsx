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
        image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=300&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=300&fit=crop&q=80",
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
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop&q=80",
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
        <section id="network" className="py-32 relative bg-background overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-muted/20" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute left-0 bottom-0 w-1/3 h-[400px] bg-critical/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-6 mb-20">
                    <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
                        Ecosystem
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl text-balance">
                        Platform <span className="bg-gradient-to-r from-muted-foreground to-foreground bg-clip-text text-transparent">Capabilities</span>
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground text-lg leading-relaxed">
                        Tailored, high-performance interfaces engineered for every stakeholder in the critical blood supply chain.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {modules.map((module, index) => (
                        <motion.div
                            key={module.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="group h-full"
                        >
                            <Card className="h-full relative overflow-hidden bg-background/50 backdrop-blur-xl border-border/40 shadow-xl shadow-black/5 dark:shadow-white/5 transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-primary/5 group-hover:-translate-y-1">
                                {/* Module Image */}
                                <div className="h-48 overflow-hidden relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={module.image}
                                        alt={module.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                </div>

                                {/* Hover Gradient Reveal */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-muted/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <CardHeader className="relative z-10 pb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-2xl shadow-xs transition-transform duration-500 group-hover:scale-110 ${module.color}`}>
                                            <module.icon className="h-6 w-6" />
                                        </div>
                                        <Badge variant="outline" className="font-medium bg-background/50 backdrop-blur-md">
                                            {module.badge}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl font-bold tracking-tight">{module.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <ul className="space-y-4 pt-2">
                                        {module.features.map((feature) => (
                                            <li key={feature} className="flex items-start text-base text-muted-foreground transition-colors group-hover:text-foreground/90">
                                                <CheckCircle2 className="h-5 w-5 mr-3 text-primary/70 shrink-0 mt-0.5" />
                                                <span className="leading-tight">{feature}</span>
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
