"use client"

import { motion } from "framer-motion"
import { Clock, Search, AlertTriangle, BarChart3 } from "lucide-react"

const problems = [
    {
        title: "Critical Delays",
        description: "Precious minutes lost locating specific blood groups during emergencies.",
        icon: Clock,
    },
    {
        title: "Manual Coordination",
        description: "Inefficient phone-based communication between hospitals and banks.",
        icon: Search,
    },
    {
        title: "Preventable Wastage",
        description: "Blood units expiring due to lack of visibility and demand forecasting.",
        icon: AlertTriangle,
    },
    {
        title: "Fragmented Data",
        description: "No centralized system to monitor availability spikes and shortages.",
        icon: BarChart3,
    },
]

export function Problem() {
    return (
        <section className="py-32 bg-background relative border-t border-border/20 overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-0 left-1/4 w-1/3 h-[400px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-6 mb-16">
                    <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
                        The Challenge
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl text-pretty max-w-3xl leading-[1.1]">
                        Critical Inefficiencies in <br />
                        <span className="text-muted-foreground/50">Emergency Procurement</span>
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground text-lg leading-relaxed">
                        The current fragmented system leads to catastrophic delays when every second counts.
                    </p>
                </div>

                {/* Visual banner */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="mb-16 rounded-3xl overflow-hidden border border-border/30 shadow-xl relative aspect-[21/7]"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1400&h=500&fit=crop&crop=center&q=80"
                        alt="Hospital emergency corridor"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-8 z-10">
                        <p className="text-white/90 text-xl sm:text-2xl font-bold tracking-tight">Every minute matters in emergency care</p>
                        <p className="text-white/50 text-sm mt-1">Current systems leave hospitals scrambling</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {problems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="flex flex-col space-y-5 p-8 rounded-3xl bg-background border border-border/40 shadow-sm hover:shadow-xl hover:border-border/80 transition-all duration-300 relative group"
                        >
                            <div className="p-4 rounded-2xl bg-muted/40 text-foreground w-fit mb-2 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                                <item.icon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                            <p className="text-muted-foreground text-base leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
