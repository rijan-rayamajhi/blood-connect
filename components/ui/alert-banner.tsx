"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type AlertType = "critical" | "moderate" | "normal" | "success"

interface AlertBannerProps {
    type?: AlertType
    title: string
    description?: string
    className?: string
    onClose?: () => void
}

export function AlertBanner({ type = "normal", title, description, className, onClose }: AlertBannerProps) {
    const styles = {
        critical: "border-critical/50 text-critical dark:border-critical [&>svg]:text-critical",
        moderate: "border-moderate/50 text-moderate dark:border-moderate [&>svg]:text-moderate",
        normal: "border-normal/50 text-normal dark:border-normal [&>svg]:text-normal",
        success: "border-success/50 text-success dark:border-success [&>svg]:text-success",
    }

    const icons = {
        critical: AlertCircle,
        moderate: AlertCircle,
        normal: Info,
        success: CheckCircle2,
    }

    const Icon = icons[type]

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={className}
            >
                <Alert variant="default" className={cn("bg-background shadow-sm px-4 py-3 w-full h-full flex flex-col items-start gap-2", styles[type])}>
                    <div className="flex w-full gap-3">
                        <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                            <AlertTitle className="text-base font-semibold leading-none tracking-tight text-foreground/90">
                                {title}
                            </AlertTitle>
                            {description && (
                                <AlertDescription className="text-sm opacity-90 leading-relaxed text-foreground/80 break-words">
                                    {description}
                                </AlertDescription>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute right-3 top-3 hover:opacity-70 transition-opacity p-1"
                        >
                            <XCircle className="h-4 w-4 opacity-50 hover:opacity-100" />
                        </button>
                    )}
                </Alert>
            </motion.div>
        </AnimatePresence>
    )
}
