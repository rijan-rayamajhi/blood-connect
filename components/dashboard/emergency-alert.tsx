"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Siren, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEmergencyStore } from "@/lib/store/emergency-store"

export function EmergencyAlert() {
    const { isAlertOpen } = useEmergencyStore()

    return (
        <AnimatePresence>
            {isAlertOpen && <AlertContent />}
        </AnimatePresence>
    )
}

function AlertContent() {
    const { dismissAlert } = useEmergencyStore()
    const [timeLeft, setTimeLeft] = useState(300) // 5 minutes fresh on mount

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) return 0
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/90 backdrop-blur-sm"
        >
            {/* Pulsing Background Effect */}
            <motion.div
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-600/20"
            />

            <div className="relative z-10 max-w-2xl w-full mx-4 p-8 bg-background border-4 border-destructive rounded-lg shadow-2xl text-center space-y-8">
                <div className="flex justify-center">
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 bg-red-500 rounded-full opacity-30 blur-xl"
                        />
                        <Siren className="h-24 w-24 text-destructive relative z-10" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-destructive tracking-tight uppercase">
                        Critical Emergency Alert
                    </h2>
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                        Mass Casualty Event Reported
                    </p>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-lg">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Immediate Action Required: Dispatch Protocol Alpha-1</span>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-2 p-6 bg-muted/50 rounded-lg border border-red-200 dark:border-red-900">
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Auto-Dispatch In
                    </span>
                    <div className="flex items-center gap-3 text-4xl font-mono font-bold text-destructive">
                        <Clock className="h-8 w-8" />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={dismissAlert}
                        className="h-16 text-lg border-2"
                    >
                        Acknowledge Only
                    </Button>
                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={dismissAlert}
                        className="h-16 text-lg font-bold animate-pulse"
                    >
                        <CheckCircle className="mr-2 h-6 w-6" />
                        Accept & Dispatch
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
