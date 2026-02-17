"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
    targetDate: Date
    className?: string
    showDays?: boolean
    urgentThreshold?: number // Minutes before urgent
}

export function CountdownTimer({ targetDate, className, showDays = true, urgentThreshold = 60 }: CountdownTimerProps) {
    const calculateTimeLeft = React.useCallback(() => {
        const difference = +new Date(targetDate) - +new Date()
        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        }

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            }
        }

        return timeLeft
    }, [targetDate])

    const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft())
    const [isUrgent, setIsUrgent] = React.useState(false)

    React.useEffect(() => {
        const timer = setTimeout(() => {
            const remaining = calculateTimeLeft()
            setTimeLeft(remaining)

            // Check urgency
            if (remaining.days === 0 && remaining.hours === 0 && remaining.minutes < urgentThreshold) {
                setIsUrgent(true)
            } else {
                setIsUrgent(false)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [calculateTimeLeft, urgentThreshold])

    // Format with leading zeros
    const format = (num: number) => (num < 10 ? `0${num}` : num)

    if (Object.keys(timeLeft).length === 0) {
        return <span className={cn("text-muted-foreground", className)}>Expired</span>
    }

    return (
        <div className={cn(
            "flex items-center font-mono space-x-1",
            isUrgent ? "text-critical animate-pulse font-bold" : "text-foreground",
            className
        )}>
            <Clock className={cn("mr-1 h-4 w-4", isUrgent ? "text-critical" : "text-muted-foreground")} />
            {showDays && timeLeft.days > 0 && (
                <>
                    <span>{timeLeft.days}d</span>
                    <span>:</span>
                </>
            )}
            <span>{format(timeLeft.hours)}h</span>
            <span>:</span>
            <span>{format(timeLeft.minutes)}m</span>
            <span>:</span>
            <span>{format(timeLeft.seconds)}s</span>
        </div>
    )
}
