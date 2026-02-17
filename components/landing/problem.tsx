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
        <section className="py-24 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-pretty">
                        The Challenge in Emergency Blood Procurement
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-lg">
                        The current fragmented system leads to critical inefficiencies when every second counts.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {problems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center space-y-4"
                        >
                            <div className="p-4 rounded-2xl bg-muted/50 text-foreground">
                                <item.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold">{item.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
