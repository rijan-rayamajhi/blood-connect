import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
    title: string
    value: string | number
    icon: React.ElementType
    description?: string
    trend?: number // Percentage change
    trendLabel?: string
    className?: string
}

export function KpiCard({ title, value, icon: Icon, description, trend, trendLabel, className }: KpiCardProps) {
    return (
        <Card className={cn("rounded-xl shadow-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(trend !== undefined || description) && (
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                        {trend !== undefined && (
                            <span className={cn(
                                "flex items-center mr-2",
                                trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground"
                            )}>
                                {trend > 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> :
                                    trend < 0 ? <ArrowDownRight className="mr-1 h-3 w-3" /> :
                                        <Minus className="mr-1 h-3 w-3" />}
                                {Math.abs(trend)}%
                            </span>
                        )}
                        {trendLabel || description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
