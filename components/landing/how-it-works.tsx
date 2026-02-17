"use client"

import { motion } from "framer-motion"

const steps = [
    {
        number: "01",
        title: "Hospital Raises Request",
        description: "Medical staff logs a critical requirement with blood group, component type, and urgency level via the secure portal."
    },
    {
        number: "02",
        title: "Instant Matching",
        description: "The system identifies nearby blood banks with available stock and instantly broadcasts an SOS alert."
    },
    {
        number: "03",
        title: "Dispatch & Tracking",
        description: "Blood bank confirms availability, dispatches the unit, and the hospital tracks the delivery in real-time."
    }
]

export function HowItWorks() {
    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-20">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-balance">
                        Streamlined Verification Process
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-lg">
                        A verified workflow designed to eliminate delays when every second matters.
                    </p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Connecting Line - Desktop Only */}
                    <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-critical/20 via-critical/50 to-critical/20 z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center relative z-10"
                        >
                            <div className="w-24 h-24 rounded-full bg-background border-4 border-muted flex items-center justify-center text-3xl font-bold text-muted-foreground mb-6 shadow-sm group hover:border-critical transition-colors duration-300">
                                <span className="group-hover:text-critical transition-colors duration-300">{step.number}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground text-sm max-w-[280px] leading-relaxed">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
