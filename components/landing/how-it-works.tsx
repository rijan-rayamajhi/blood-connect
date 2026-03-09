"use client"

import { motion } from "framer-motion"

const steps = [
    {
        number: "01",
        title: "Hospital Raises Request",
        description: "Medical staff logs a critical requirement with blood group, component type, and urgency level via the secure portal.",
        image: "https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=400&h=300&fit=crop&crop=center&q=80",
        imageAlt: "Doctor using computer in hospital"
    },
    {
        number: "02",
        title: "Instant Matching",
        description: "The system identifies nearby blood banks with available stock and instantly broadcasts an SOS alert.",
        image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop&crop=center&q=80",
        imageAlt: "Blood bags in a blood bank storage"
    },
    {
        number: "03",
        title: "Dispatch & Tracking",
        description: "Blood bank confirms availability, dispatches the unit, and the hospital tracks the delivery in real-time.",
        image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=400&h=300&fit=crop&crop=center&q=80",
        imageAlt: "Medical delivery and logistics"
    }
]

export function HowItWorks() {
    return (
        <section className="py-32 relative bg-background overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-critical/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center space-y-6 mb-24">
                    <div className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
                        Process
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl text-balance">
                        Streamlined Verification Process
                    </h2>
                    <p className="max-w-[650px] text-muted-foreground text-lg leading-relaxed">
                        A verified workflow designed from the ground up to eliminate delays when every second matters.
                    </p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                    {/* Connecting Line - Desktop Only */}
                    <div className="hidden md:block absolute top-[7rem] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-critical/30 to-transparent z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="flex flex-col items-center text-center relative z-10 group"
                        >
                            {/* Image thumbnail */}
                            <div className="w-full max-w-[280px] aspect-[4/3] rounded-2xl overflow-hidden border border-border/40 shadow-lg mb-6 group-hover:shadow-xl group-hover:border-critical/30 transition-all duration-500 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={step.image}
                                    alt={step.imageAlt}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                {/* Step number badge */}
                                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm border border-border/60 shadow-md group-hover:bg-critical group-hover:text-white group-hover:border-critical/60 transition-all duration-300">
                                    {step.number}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight mb-4 transition-colors group-hover:text-foreground">{step.title}</h3>
                            <p className="text-muted-foreground text-base max-w-[300px] leading-relaxed transition-colors group-hover:text-muted-foreground/90">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
