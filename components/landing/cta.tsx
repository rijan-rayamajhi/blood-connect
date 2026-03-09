"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function CTA() {
    return (
        <section className="py-32 bg-background relative px-4 md:px-6">
            <div className="container p-0">
                <div className="relative rounded-[2.5rem] overflow-hidden bg-zinc-950 dark:bg-zinc-900 border border-border/10 shadow-2xl min-h-[500px] flex items-center">
                    {/* Background Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=1600&h=800&fit=crop&q=80"
                        alt="Medical team background"
                        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
                    />

                    {/* Inner glowing core */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-critical/20 blur-[130px] pointer-events-none mix-blend-screen" />

                    <div className="relative z-10 px-6 py-20 md:py-24 flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[4rem] text-balance text-white leading-[1.1]">
                                Digitize Emergency Blood Coordination Today
                            </h2>
                            <p className="text-zinc-400 md:text-xl text-balance leading-relaxed max-w-2xl mx-auto">
                                Join the national network of modern healthcare institutions ensuring 24/7 critical blood availability.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            viewport={{ once: true }}
                            className="flex flex-col sm:flex-row gap-5 w-full justify-center pt-6"
                        >
                            <Button size="lg" className="rounded-full bg-critical hover:bg-critical/90 text-white h-14 px-10 text-lg shadow-xl shadow-critical/20 transition-all hover:scale-[1.02]" asChild>
                                <Link href="/register">
                                    Register Your Organization
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full border-zinc-700 bg-white/5 hover:bg-white/10 text-white h-14 px-10 text-lg transition-all backdrop-blur-md" asChild>
                                <Link href="#">
                                    Contact Sales <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
