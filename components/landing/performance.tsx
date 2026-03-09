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
        <section className="py-32 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center rounded-full border border-border bg-background/50 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
                            <Zap className="h-4 w-4 mr-2 text-amber-500" />
                            High Performance Infrastructure
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-balance leading-[1.1]">
                            Built for Speed, <br />
                            <span className="bg-gradient-to-r from-critical to-red-600 bg-clip-text text-transparent">Secured for Trust.</span>
                        </h2>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-[550px] leading-relaxed">
                            When lives are at stake, performance isn&apos;t optional. Our architecture ensures milliseconds latency and absolute data integrity for every request.
                        </p>
                        {/* Server/Tech Image */}
                        <div className="rounded-2xl overflow-hidden border border-border/30 shadow-lg aspect-[16/9] max-w-md hidden lg:block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=340&fit=crop&crop=center&q=80"
                                alt="Server infrastructure ensuring high availability"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {metrics.map((metric, index) => (
                            <motion.div
                                key={metric.title}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                                viewport={{ once: true, margin: "-50px" }}
                            >
                                <Card className="bg-background/80 backdrop-blur-xl border-border/40 shadow-lg shadow-black/5 dark:shadow-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 h-full relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent dark:from-white/0 pointer-events-none" />
                                    <CardHeader className="pb-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-xl ${metric.bg} ${metric.color} flex items-center justify-center mb-4 shadow-sm backdrop-blur-md`}>
                                            <metric.icon className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-2xl font-bold tracking-tight">{metric.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <p className="text-base text-muted-foreground leading-relaxed">
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
