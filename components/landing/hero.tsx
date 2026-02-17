"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            {/* Background gradients - Red to Blue subtle */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-critical/10 via-background to-blue-500/5" />
            <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-critical/5 blur-[100px]" />
            <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground shadow-sm"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-critical mr-2 animate-[pulse_1.5s_ease-in-out_infinite]" />
                        <span className="font-medium text-critical">Live</span>
                        <span className="mx-2 text-muted-foreground/50">|</span>
                        Emergency Response System
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl text-balance"
                    >
                        Real-Time Emergency <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-critical to-blue-600 bg-clip-text text-transparent">Blood Coordination</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mx-auto max-w-[750px] text-muted-foreground md:text-xl text-balance leading-relaxed"
                    >
                        Connecting hospitals and blood banks instantly to save lives during critical moments.
                        The centralized platform for rapid blood procurement and management.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 min-w-[300px]"
                    >
                        <Button size="lg" className="bg-critical hover:bg-critical/90 h-14 px-8 text-lg shadow-lg shadow-critical/20" asChild>
                            <Link href="/login">
                                Login to Portal <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2" asChild>
                            <Link href="/register">
                                Register Organization
                            </Link>
                        </Button>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
