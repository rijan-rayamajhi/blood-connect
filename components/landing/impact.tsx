"use client"

import { motion } from "framer-motion"

const metrics = [
    { label: "Active Blood Banks", value: "150+" },
    { label: "Hospitals Connected", value: "300+" },
    { label: "Emergency Fulfillment", value: "98%" },
    { label: "Wastage Reduction", value: "35%" },
]

export function Impact() {
    return (
        <section id="impact" className="py-24 border-y border-border/20 bg-background relative overflow-hidden">
            {/* Ambient background image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="https://images.unsplash.com/photo-1557825835-b7467941219b?w=1600&h=800&fit=crop&q=80"
                alt="Network connectivity background"
                className="absolute inset-0 w-full h-full object-cover opacity-[0.03] dark:opacity-[0.07] pointer-events-none"
            />

            {/* Ambient subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-20">
                    <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                        Trusted Impact
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl">
                        Empowering healthcare networks to save more lives through unparalleled efficiency.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center space-y-3"
                        >
                            <span className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent mb-1">
                                {metric.value}
                            </span>
                            <span className="text-base sm:text-lg text-muted-foreground font-semibold tracking-wide">
                                {metric.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
