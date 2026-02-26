import { ReactNode } from "react"
import { Send, CheckCircle2, AlertTriangle, XCircle, Droplets, X, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type TimelineStatus = "Sent" | "Accepted" | "Partially Accepted" | "Rejected" | "Collected" | "Cancelled"

export interface TimelineEvent {
    status: TimelineStatus
    title: string
    description?: ReactNode
    date?: string
    isActive: boolean
    isCurrent: boolean
}

interface TimelineProps {
    events: TimelineEvent[]
    className?: string
}

// Map statuses to specific Lucide icons
const statusIconMap: Record<TimelineStatus, LucideIcon> = {
    "Sent": Send,
    "Accepted": CheckCircle2,
    "Partially Accepted": AlertTriangle,
    "Rejected": XCircle,
    "Collected": Droplets,
    "Cancelled": X
}

// Map statuses to Tailwind color classes for the icon ring
const statusColorMap: Record<TimelineStatus, { active: string; current: string; inactive: string }> = {
    "Sent": {
        active: "border-primary bg-primary text-primary-foreground",
        current: "border-primary text-primary bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "Accepted": {
        active: "border-green-600 bg-green-600 text-white",
        current: "border-green-600 text-green-600 bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "Partially Accepted": {
        active: "border-amber-500 bg-amber-500 text-white",
        current: "border-amber-500 text-amber-500 bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "Rejected": {
        active: "border-destructive bg-destructive text-destructive-foreground",
        current: "border-destructive text-destructive bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "Collected": {
        active: "border-blue-600 bg-blue-600 text-white",
        current: "border-blue-600 text-blue-600 bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    },
    "Cancelled": {
        active: "border-destructive bg-destructive text-destructive-foreground",
        current: "border-destructive text-destructive bg-background",
        inactive: "border-muted-foreground text-muted-foreground bg-background"
    }
}

export function Timeline({ events, className }: TimelineProps) {
    if (!events?.length) return null

    return (
        <div className={cn(
            "relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-8 before:h-full before:w-[2px] before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent mt-4 pb-4",
            className
        )}>
            {events.map((step, index) => {
                const Icon = statusIconMap[step.status]
                const colorConfig = statusColorMap[step.status]

                let ringColorClass = colorConfig.inactive
                if (step.isCurrent) {
                    ringColorClass = colorConfig.current
                } else if (step.isActive) {
                    ringColorClass = colorConfig.active
                }

                return (
                    <div key={index} className={cn("relative flex gap-6 items-start", !step.isActive && "opacity-50")}>
                        {/* Icon Indicator */}
                        <div className={cn(
                            "absolute left-2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border-2 z-10 transition-colors",
                            ringColorClass
                        )}>
                            <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 ml-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-1">
                                <h4 className={cn("text-base font-bold", step.isCurrent && "text-foreground")}>
                                    {step.title}
                                </h4>
                                {step.date && (
                                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-sm w-fit shrink-0">
                                        {step.date}
                                    </span>
                                )}
                            </div>
                            {step.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                    {step.description}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
