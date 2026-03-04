import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
    rows?: number
    columns?: number
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
    return (
        <div className="space-y-3" role="status" aria-label="Loading table data">
            {/* Header row */}
            <div className="flex gap-4 px-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={`h-${i}`} className="h-4 flex-1" />
                ))}
            </div>

            <div className="border rounded-lg overflow-hidden">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div
                        key={`r-${rowIndex}`}
                        className="flex items-center gap-4 px-4 py-3 border-b last:border-0"
                    >
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <Skeleton
                                key={`c-${rowIndex}-${colIndex}`}
                                className="h-4 flex-1"
                            />
                        ))}
                    </div>
                ))}
            </div>

            <span className="sr-only">Loading...</span>
        </div>
    )
}
