import { RequestStatus } from "@/types/request"
import { formatRequestStatus } from "@/lib/utils/request-status-map"
import { Send, CheckCircle2, AlertTriangle, XCircle, Droplets, X, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type ExtendedRequestStatus = RequestStatus | "escalated"

export interface RequestTimelineEvent {
    status: ExtendedRequestStatus
    timestamp: number
}

interface RequestTimelineProps {
    timeline: RequestTimelineEvent[]
    className?: string
}

const statusIconMap: Record<ExtendedRequestStatus, LucideIcon> = {
    "sent": Send,
    "accepted": CheckCircle2,
    "partially-accepted": AlertTriangle,
    "rejected": XCircle,
    "collected": Droplets,
    "cancelled": X,
    "escalated": AlertTriangle // Re-using AlertTriangle for escalated
}

const statusColorMap: Record<ExtendedRequestStatus, { active: string; current: string; inactive: string }> = {
    "sent": {
        active: "border-primary bg-primary text-primary-foreground",
        current: "border-primary text-primary bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "accepted": {
        active: "border-green-600 bg-green-600 text-white",
        current: "border-green-600 text-green-600 bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "partially-accepted": {
        active: "border-amber-500 bg-amber-500 text-white",
        current: "border-amber-500 text-amber-500 bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "rejected": {
        active: "border-destructive bg-destructive text-destructive-foreground",
        current: "border-destructive text-destructive bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "collected": {
        active: "border-blue-600 bg-blue-600 text-white",
        current: "border-blue-600 text-blue-600 bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "cancelled": {
        active: "border-destructive bg-destructive text-destructive-foreground",
        current: "border-destructive text-destructive bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "escalated": {
        active: "border-red-600 bg-red-600 text-white",
        current: "border-red-600 text-red-600 bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    }
}

export function RequestTimeline({ timeline, className }: RequestTimelineProps) {
    if (!timeline?.length) return null

    // Sort ascending by timestamp
    const sortedEvents = [...timeline].sort((a, b) => a.timestamp - b.timestamp)
    const latestTimestamp = sortedEvents[sortedEvents.length - 1].timestamp

    return (
        <div
            className={cn(
                "relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:h-full before:w-[2px] before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent mt-4 pb-4",
                className
            )}
            role="list"
            aria-label="Request Timeline"
        >
            {sortedEvents.map((event, index) => {
                const isCurrent = event.timestamp === latestTimestamp
                // Active if it is NOT the current one (meaning it's in the past) or if it's the only one
                const isActive = event.timestamp < latestTimestamp || sortedEvents.length === 1

                const Icon = statusIconMap[event.status]
                const colorConfig = statusColorMap[event.status]

                let ringColorClass = colorConfig.inactive
                if (isCurrent) {
                    ringColorClass = colorConfig.current
                } else if (isActive) {
                    ringColorClass = colorConfig.active
                }

                // Format timestamp for accessible readability
                const dateObj = new Date(event.timestamp)
                const dateStr = dateObj.toLocaleDateString()
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                return (
                    <div
                        key={`${event.status}-${event.timestamp}-${index}`}
                        className={cn("relative flex gap-6 items-start", !isActive && !isCurrent && "opacity-50")}
                        role="listitem"
                        aria-current={isCurrent ? "step" : undefined}
                    >
                        {/* Icon Indicator */}
                        <div
                            aria-hidden="true"
                            className={cn(
                                "absolute left-2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 z-10 transition-colors",
                                ringColorClass
                            )}
                        >
                            <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 ml-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1">
                                <h4 className={cn("text-base font-bold", isCurrent && "text-foreground")}>
                                    {event.status === "escalated" ? "Escalated" : formatRequestStatus(event.status)}
                                </h4>
                                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-sm w-fit shrink-0">
                                    {dateStr} {timeStr}
                                </span>
                            </div>
                            {isCurrent && (
                                <div className="text-sm text-muted-foreground mt-1">
                                    Currently in {event.status === "escalated" ? "escalated" : formatRequestStatus(event.status).toLowerCase()} status.
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
