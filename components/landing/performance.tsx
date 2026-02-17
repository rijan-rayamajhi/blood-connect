"use client"

import { Zap, Shield, Server, FileCheck } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const metrics = [
    {
        title: "< 2 Seconds",
        description: "Average request latency for SOS broadcasts.",
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
    {
        title: "99.9% Uptime",
        description: "Guaranteed availability with redundant failovers.",
        icon: Server,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    },
    {
        title: "E2E Encrypted",
        description: "HIPAA/GDPR compliant security standards.",
        icon: Shield,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        title: "Audit Logs",
        description: "Immutable records of every transaction.",
        icon: FileCheck,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    }
]

export function Performance() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground shadow-sm">
                            <Zap className="h-4 w-4 mr-2 text-critical" />
                            High Performance Infrastructure
                        </div>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-5xl lg:text-6xl text-balance">
                            Built for Speed, <br />
                            <span className="text-critical">Secured for Trust.</span>
                        </h2>
                        <p className="text-muted-foreground md:text-xl max-w-[500px] leading-relaxed">
                            When lives are at stake, performance isn&apos;t optional. Our architecture ensures milliseconds latency and absolute data integrity for every request.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {metrics.map((metric, index) => (
                            <motion.div
                                key={metric.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="border-muted-foreground/10 shadow-sm transition-all hover:shadow-md h-full">
                                    <CardHeader className="pb-2">
                                        <div className={`w-10 h-10 rounded-lg ${metric.bg} ${metric.color} flex items-center justify-center mb-3`}>
                                            <metric.icon className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold">{metric.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            {metric.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
