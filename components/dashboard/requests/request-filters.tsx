"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRequestStore } from "@/lib/store/request-store"
import { RequestStatus, RequestUrgency } from "@/types/request"

export function RequestFilters() {
    const { filterStatus, filterUrgency, setFilterStatus, setFilterUrgency } = useRequestStore()

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as RequestStatus | "All")}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filterUrgency}
                onValueChange={(value) => setFilterUrgency(value as RequestUrgency | "All")}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Urgency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Urgencies</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
