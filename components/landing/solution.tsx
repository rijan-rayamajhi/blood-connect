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
        <section id="features" className="py-32 relative bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-border/30 overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-0 right-0 w-1/2 h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-6 mb-16">
                    <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
                        The Solution
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-balance leading-[1.1]">
                        A Centralized <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">Information Hub</span>
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                        The definitive infrastructure connecting the entire blood ecosystem in real-time, completely eliminating manual coordination.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side: Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="lg:col-span-5 relative"
                    >
                        <div className="relative rounded-[2rem] overflow-hidden border border-border/40 shadow-2xl aspect-[4/5]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="https://images.unsplash.com/photo-1576091160550-217359f49f4a?w=800&h=1000&fit=crop&q=80"
                                alt="Advanced medical technology"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent" />
                        </div>
                        {/* Decorative floating element */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/20 blur-2xl rounded-full" />
                    </motion.div>

                    {/* Right Side: Features Grid */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {solutions.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                                viewport={{ once: true, margin: "-50px" }}
                                className="group"
                            >
                                <Card className="h-full bg-background/60 backdrop-blur-xl border-border/40 shadow-lg shadow-black/5 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden">
                                    <CardHeader className="pb-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-xl font-bold tracking-tight">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
                                        <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground/80 transition-colors">
                                            {feature.description}
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
