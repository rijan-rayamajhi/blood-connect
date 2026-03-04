"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataPaginationProps {
    currentPage: number
    totalItems: number
    pageSize?: number
    onPageChange: (page: number) => void
}

export function DataPagination({
    currentPage,
    totalItems,
    pageSize = 20,
    onPageChange,
}: DataPaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalItems)

    return (
        <div
            className="flex items-center justify-between flex-wrap gap-3 pt-4"
            aria-live="polite"
            aria-atomic="true"
        >
            <p className="text-sm text-muted-foreground">
                Showing {totalItems > 0 ? start : 0}–{end} of {totalItems}{" "}
                {totalItems === 1 ? "item" : "items"}
            </p>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm font-medium tabular-nums min-w-[80px] text-center">
                    Page {currentPage} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
