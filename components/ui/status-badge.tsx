import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusType = "critical" | "moderate" | "normal" | "success" | "neutral"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    status: StatusType | string
    children?: React.ReactNode
}

export function StatusBadge({ status, children, className, ...props }: StatusBadgeProps) {
    const getVariant = (s: string) => {
        switch (s.toLowerCase()) {
            case "critical":
            case "high":
                return "bg-critical text-critical-foreground hover:bg-critical/90"
            case "moderate":
            case "medium":
                return "bg-moderate text-moderate-foreground hover:bg-moderate/90"
            case "normal":
            case "low":
                return "bg-normal text-normal-foreground hover:bg-normal/90"
            case "success":
            case "completed":
                return "bg-success text-success-foreground hover:bg-success/90"
            default:
                return "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }
    }

    return (
        <Badge
            className={cn("capitalize rounded-md px-2 py-0.5", getVariant(status), className)}
            {...props}
        >
            {children || status}
        </Badge>
    )
}
