"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { useDonorStore } from "@/lib/store/donor-store"
import { columns } from "@/components/dashboard/donors/columns"
import { AddDonorModal } from "@/components/dashboard/donors/add-donor-modal"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TableSkeleton } from "@/components/ui/skeletons"
import { EmptyState } from "@/components/ui/empty-state"

import { Badge } from "@/components/ui/badge"
import { Phone, Mail } from "lucide-react"
import { DonorActions } from "@/components/dashboard/donors/donor-actions"

export default function DonorsPage() {
    const { donors, isLoading } = useDonorStore()
    const [filterValue, setFilterValue] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")

    const filteredDonors = donors.filter((donor) => {
        const matchesSearch = donor.fullName.toLowerCase().includes(filterValue.toLowerCase()) ||
            donor.bloodGroup.toLowerCase().includes(filterValue.toLowerCase())
        const matchesStatus = statusFilter === "All" || donor.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Donor Management</h1>
                    <p className="text-muted-foreground">
                        Register and manage blood donors. Track donation history and availability.
                    </p>
                </div>
                <AddDonorModal />
            </div>

            <Card>
                <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search donors by name or group..."
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Ineligible">Ineligible</SelectItem>
                                <SelectItem value="Temporary Deferral">Temporary Deferral</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="w-full sm:w-auto md:hidden">
                            <Filter className="mr-2 h-4 w-4" />
                            More Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <TableSkeleton />
            ) : filteredDonors.length > 0 ? (
                <>
                    <div className="hidden md:block">
                        <DataTable columns={columns} data={filteredDonors} />
                    </div>
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        {filteredDonors.map((donor) => (
                            <Card key={donor.id}>
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-lg">{donor.fullName}</div>
                                            <div className="text-xs text-muted-foreground">{donor.id}</div>
                                        </div>
                                        <Badge variant="outline" className="font-bold">
                                            {donor.bloodGroup}
                                        </Badge>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <Badge
                                            variant={donor.status === "Available" ? "default" : donor.status === "Ineligible" ? "destructive" : "secondary"}
                                            className={donor.status === "Available" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                        >
                                            {donor.status}
                                        </Badge>
                                        <div className="text-sm font-medium">
                                            {donor.totalDonations} Donations
                                        </div>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        Last Donation: <span className="text-foreground">{donor.lastDonationDate}</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                                        <div className="flex gap-4">
                                            <a href={`tel:${donor.contactNumber}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                                                <Phone className="h-4 w-4" />
                                                <span className="sr-only">Call</span>
                                            </a>
                                            <a href={`mailto:${donor.email}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                                                <Mail className="h-4 w-4" />
                                                <span className="sr-only">Email</span>
                                            </a>
                                        </div>
                                        <DonorActions donor={donor} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            ) : (
                <EmptyState
                    title="No Donors Found"
                    description={
                        filterValue
                            ? `No donors match "${filterValue}"`
                            : "No donors registered yet."
                    }
                    actionLabel={filterValue ? "Clear Search" : "Register Donor"}
                    onAction={
                        filterValue
                            ? () => setFilterValue("")
                            : () => {
                                // Logic to open AddModal or redirect
                                // Since AddModal is a dialog, we might point to it or just leave empty for now
                                // or better, trigger the modal trigger if possible, but here we just clear search
                            }
                    }
                />
            )}
        </div>
    )
}
