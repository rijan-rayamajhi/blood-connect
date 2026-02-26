"use client"

import { useState } from "react"
import { useRequestStore } from "@/lib/store/request-store"
import { HospitalRequestCard } from "@/components/hospital/hospital-request-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { CardListSkeleton } from "@/components/ui/skeletons"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RequestStatus, UrgencyLevel } from "@/lib/store/request-store"

export default function HospitalRequestsPage() {
    const { requests, isLoading } = useRequestStore()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState<RequestStatus | "All">("All")
    const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | "All">("All")

    const itemsPerPage = 6

    // Filter requests
    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "All" || req.status === filterStatus
        const matchesUrgency = filterUrgency === "All" || req.urgency === filterUrgency

        return matchesSearch && matchesStatus && matchesUrgency
    })

    // Sort by urgency (Critical first) and then required date
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

    // Reset filters
    const clearFilters = () => {
        setSearchTerm("")
        setFilterStatus("All")
        setFilterUrgency("All")
        setCurrentPage(1)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Requests</h1>
                <p className="text-muted-foreground">
                    Track and manage your blood unit requests.
                </p>
            </div>

            {/* Custom Filter Section for Hospital View */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, Group, or Hospital..."
                        className="pl-9 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value as RequestStatus | "All")}
                >
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Statuses</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Accepted">Accepted</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filterUrgency}
                    onValueChange={(value) => setFilterUrgency(value as UrgencyLevel | "All")}
                >
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Urgencies</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <CardListSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {paginatedRequests.length > 0 ? (
                        paginatedRequests.map((req) => (
                            <HospitalRequestCard key={req.id} request={req} />
                        ))
                    ) : (
                        <div className="col-span-full">
                            <EmptyState
                                icon={FileText}
                                title="No Requests Found"
                                description="You have no blood requests matching your current filters."
                                actionLabel={searchTerm || filterStatus !== "All" || filterUrgency !== "All" ? "Clear Filters" : undefined}
                                onAction={clearFilters}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Control */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-4">
                    <p className="text-sm text-muted-foreground order-2 sm:order-1">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedRequests.length)} of {sortedRequests.length} requests
                    </p>
                    <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="flex-1 sm:flex-none"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="flex-1 sm:flex-none"
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
