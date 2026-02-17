"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { useStaffStore } from "@/lib/store/staff-store"
import { columns } from "@/components/dashboard/staff/columns"
import { AddStaffModal } from "@/components/dashboard/staff/add-staff-modal"
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

export default function StaffPage() {
    const staffList = useStaffStore((state) => state.staffList)
    const [filterValue, setFilterValue] = useState("")
    const [roleFilter, setRoleFilter] = useState("All")

    const filteredStaff = staffList.filter((staff) => {
        const matchesSearch = staff.name.toLowerCase().includes(filterValue.toLowerCase()) ||
            staff.email.toLowerCase().includes(filterValue.toLowerCase())
        const matchesRole = roleFilter === "All" || staff.role === roleFilter

        return matchesSearch && matchesRole
    })

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage team members, assign roles, and track activity.
                    </p>
                </div>
                <AddStaffModal />
            </div>

            <Card>
                <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search staff by name or email..."
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select
                            value={roleFilter}
                            onValueChange={setRoleFilter}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Roles</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Inventory Manager">Inventory Manager</SelectItem>
                                <SelectItem value="Request Handler">Request Handler</SelectItem>
                                <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="w-full sm:w-auto md:hidden">
                            <Filter className="mr-2 h-4 w-4" />
                            More Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <DataTable columns={columns} data={filteredStaff} />
        </div>
    )
}
