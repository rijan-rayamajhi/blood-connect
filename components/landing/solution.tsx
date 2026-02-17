"use client"

import { motion } from "framer-motion"
import {
    Activity,
    Siren,
    Network,
    ShieldCheck
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const solutions = [
    {
        title: "Real-Time Inventory Visibility",
        description: "Live, granular tracking of blood stock levels across all connected blood banks with zero latency.",
        icon: Activity,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        title: "Emergency SOS Alert System",
        description: "Continuous critical broadcast system to active donors and nearby hospitals for effortless request fulfillment.",
        icon: Siren,
        color: "text-critical",
        bg: "bg-critical/10"
    },
    {
        title: "Smart Matching",
        description: "Intelligent hospital-to-blood-bank pairing algorithms based on distance, stock availability, and urgency.",
        icon: Network,
        color: "text-violet-500",
        bg: "bg-violet-500/10"
    },
    {
        title: "Govt. Grade Monitoring",
        description: "Full audit trails, compliance logging, and comprehensive analytics for health department oversight.",
        icon: ShieldCheck,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    }
]

export function Solution() {
    return (
        <section className="py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                        A Centralized Emergency-First Platform
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-lg">
                        The only platform connecting the entire blood ecosystem in real-time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {solutions.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full border-muted-foreground/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${feature.bg} ${feature.color} flex items-center justify-center mb-4`}>
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
