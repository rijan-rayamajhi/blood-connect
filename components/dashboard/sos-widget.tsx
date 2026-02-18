"use client"

import { motion } from "framer-motion"
import { Siren, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CountdownTimer } from "@/components/ui/countdown-timer"

interface SosWidgetProps {
    hospitalName: string
    bloodGroup: string
    units: number
    location: string
    timeElapsed: string // Mocked for now, ideally calculated
    targetDate: Date
}

export function SosWidget({ hospitalName, bloodGroup, units, location, timeElapsed, targetDate }: SosWidgetProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-500 p-1 shadow-lg"
        >
            {/* Pulse Animation Background */}
            <motion.div
                className="absolute inset-0 bg-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-4 rounded-lg bg-background/10 backdrop-blur-sm p-6 text-white border border-white/20">
                <div className="flex items-start gap-4 w-full lg:w-auto">
                    <div className="p-3 bg-white/20 rounded-full shrink-0 animate-pulse">
                        <Siren className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="destructive" className="bg-white text-critical hover:bg-white/90 font-bold border-none">
                                CRITICAL SOS
                            </Badge>
                            <span className="text-white/80 text-sm font-medium flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Elapsed: {timeElapsed}
                            </span>
                        </div>
                        <h3 className="text-xl lg:text-2xl font-bold leading-tight">
                            {hospitalName}
                        </h3>
                        <p className="text-white/90 text-sm">
                            {location}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-lg w-full lg:w-auto min-w-[120px]">
                    <span className="text-xs text-white/70 uppercase font-bold tracking-wider mb-1">Required</span>
                    <div className="text-2xl lg:text-3xl font-black text-white flex items-center gap-2">
                        {bloodGroup}
                        <span className="text-lg font-medium opacity-80">({units}u)</span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center w-full lg:w-auto gap-3">
                    <div className="text-center">
                        <span className="text-xs text-white/70 font-medium mb-1 block">Auto-Expire In</span>
                        <CountdownTimer targetDate={targetDate} className="text-white font-bold text-lg" showDays={false} />
                    </div>
                    <Button variant="secondary" className="w-full lg:w-auto font-bold shadow-lg hover:scale-105 transition-transform">
                        Respond Now
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
