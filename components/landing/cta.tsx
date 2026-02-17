"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function CTA() {
    return (
        <section className="py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-balance">
                            Digitize Emergency Blood Coordination Today
                        </h2>
                        <p className="text-muted-foreground md:text-xl text-balance leading-relaxed">
                            Join the national network of modern healthcare institutions ensuring 24/7 blood availability.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4"
                    >
                        <Button size="lg" className="bg-critical hover:bg-critical/90 h-14 px-8 text-lg shadow-lg shadow-critical/20" asChild>
                            <Link href="/register">
                                Register Your Organization
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-background" asChild>
                            <Link href="#">
                                Contact Sales <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
