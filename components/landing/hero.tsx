"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Activity, Users, Clock } from "lucide-react"

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-36 pb-16 lg:pt-48 lg:pb-24">
            {/* Background elements - Premium glow effect */}
            <div className="absolute inset-0 -z-10 bg-background" />

            {/* Ambient animated gradient meshes */}
            <div className="absolute top-0 right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-critical/10 blur-[120px] mix-blend-screen opacity-50 dark:opacity-30" />
            <div className="absolute top-1/4 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen opacity-50 dark:opacity-30" />

            {/* Grid overlay for texture */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center space-y-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center rounded-full border border-critical/20 bg-critical/5 px-4 py-1.5 text-sm font-medium text-critical shadow-sm backdrop-blur-md"
                    >
                        <span className="flex h-2.5 w-2.5 rounded-full bg-critical mr-2.5 relative">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-critical opacity-75"></span>
                        </span>
                        <span>Live Global Emergency Response</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-[5rem] max-w-5xl text-balance leading-[1.1]"
                    >
                        Instant Blood Matching <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent dark:from-white dark:via-white dark:to-white/70">When Every </span>
                        <span className="bg-gradient-to-r from-critical via-red-500 to-orange-500 bg-clip-text text-transparent">Second Counts</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl text-balance leading-relaxed"
                    >
                        The intelligent infrastructure connecting hospitals and blood banks seamlessly.
                        Automated coordination that saves lives in critical moments.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-4 min-w-[320px] pt-4"
                    >
                        <Button size="lg" className="rounded-full bg-critical hover:bg-critical/90 h-14 px-8 text-base shadow-xl shadow-critical/20 transition-all hover:scale-[1.02]" asChild>
                            <Link href="/login">
                                Access Portal <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-border/50 bg-background/50 backdrop-blur-sm hover:bg-muted transition-all" asChild>
                            <Link href="/register">
                                Register Organization
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Hero Visual — Real Photo + Floating Stat Cards */}
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                className="container px-4 md:px-6 mt-20 lg:mt-28 relative z-10"
            >
                <div className="relative mx-auto max-w-6xl">
                    {/* Glow behind the image */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-critical/20 via-blue-500/20 to-critical/20 rounded-3xl blur-2xl opacity-50 -z-10" />

                    {/* Main image container */}
                    <div className="relative rounded-3xl overflow-hidden border border-border/30 shadow-2xl shadow-black/20 dark:shadow-black/60 aspect-[16/7]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1400&h=600&fit=crop&crop=center&q=80"
                            alt="Medical professional handling blood bags in a hospital environment"
                            className="w-full h-full object-cover"
                        />
                        {/* Dark overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                        {/* Floating stat cards over the image */}
                        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 1.0 }}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg"
                            >
                                <div className="p-2.5 bg-critical/20 rounded-xl">
                                    <Activity className="h-6 w-6 text-critical" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-xl leading-none">98%</p>
                                    <p className="text-white/60 text-sm mt-0.5">Fulfillment Rate</p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg"
                            >
                                <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                    <Users className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-xl leading-none">300+</p>
                                    <p className="text-white/60 text-sm mt-0.5">Connected Hospitals</p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 1.4 }}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg"
                            >
                                <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                                    <Clock className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-xl leading-none">&lt; 2s</p>
                                    <p className="text-white/60 text-sm mt-0.5">Response Time</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
