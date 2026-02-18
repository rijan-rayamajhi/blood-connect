"use client"

import { useState } from "react"
import { useRequestStore } from "@/lib/store/request-store"
import { RequestCard } from "@/components/dashboard/requests/request-card"
import { RequestFilters } from "@/components/dashboard/requests/request-filters"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { CardListSkeleton } from "@/components/ui/skeletons"

export default function RequestsPage() {
    const { requests, isLoading, filterStatus, filterUrgency } = useRequestStore()
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6

    // Filter requests
    const filteredRequests = requests.filter((req) => {
        const matchesStatus = filterStatus === "All" || req.status === filterStatus
        const matchesUrgency = filterUrgency === "All" || req.urgency === filterUrgency
        return matchesStatus && matchesUrgency
    })

    // Sort by urgency (Critical first) and then date
    const sortedRequests = [...filteredRequests].sort((a, b) => {
        const urgencyOrder = { "Critical": 0, "Urgent": 1, "Normal": 2 }
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
            return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        }
        return new Date(a.requiredDate).getTime() - new Date(b.requiredDate).getTime()
    })

    // Pagination logic
    const totalPages = Math.ceil(sortedRequests.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedRequests = sortedRequests.slice(startIndex, startIndex + itemsPerPage)

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1)
    }

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Request Management</h1>
                <p className="text-muted-foreground">
                    Manage incoming blood requests from hospitals. Prioritize critical cases.
                </p>
            </div>

            <RequestFilters />

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CardListSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedRequests.length > 0 ? (
                        paginatedRequests.map((req) => (
                            <RequestCard key={req.id} request={req} />
                        ))
                    ) : (
                        <div className="col-span-full">
                            <EmptyState
                                icon={FileText}
                                title="No Requests Found"
                                description="There are no blood requests matching your current filters."
                                actionLabel={filterStatus !== "All" || filterUrgency !== "All" ? "Clear Filters" : undefined}
                                onAction={() => {
                                    /* We would trigger a store action here to clear filters */
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Simple Pagination Control */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedRequests.length)} of {sortedRequests.length} requests
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
