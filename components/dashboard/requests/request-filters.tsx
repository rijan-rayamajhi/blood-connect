"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRequestStore, RequestStatus, UrgencyLevel } from "@/lib/store/request-store"

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
                onValueChange={(value) => setFilterUrgency(value as UrgencyLevel | "All")}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Urgency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Urgencies</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}
