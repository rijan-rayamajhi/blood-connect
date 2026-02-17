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
        <section className="py-24 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Trusted Impact
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-lg">
                        Empowering healthcare networks to save more lives through efficiency.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center"
                        >
                            <span className="text-4xl md:text-5xl font-bold text-primary mb-2">
                                {metric.value}
                            </span>
                            <span className="text-sm md:text-base text-muted-foreground font-medium">
                                {metric.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
