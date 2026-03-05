import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface ChartSkeletonProps {
    height?: number
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
    return (
        <Card role="status" aria-label="Loading chart">
            <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3" style={{ height }}>
                    {/* Simulated bar chart skeleton */}
                    <div className="flex items-end gap-2 h-full pt-4">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="flex-1 rounded-t"
                                style={{
                                    height: `${30 + (i * 13) % 60}%`,
                                }}
                            />
                        ))}
                    </div>
                </div>
                <span className="sr-only">Loading...</span>
            </CardContent>
        </Card>
    )
}
