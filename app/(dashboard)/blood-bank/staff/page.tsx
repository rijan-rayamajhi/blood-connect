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
import { Badge } from "@/components/ui/badge"
import { Shield, Mail, Phone } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StaffActions } from "@/components/dashboard/staff/staff-actions"

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

            <div className="hidden md:block">
                <DataTable columns={columns} data={filteredStaff} />
            </div>
            <div className="md:hidden grid grid-cols-1 gap-4">
                {filteredStaff.map((staff) => (
                    <Card key={staff.id}>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${staff.name}`} alt={staff.name} />
                                        <AvatarFallback>
                                            {staff.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold">{staff.name}</div>
                                        <div className="text-xs text-muted-foreground">{staff.email}</div>
                                    </div>
                                </div>
                                <StaffActions staff={staff} />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge variant={
                                    staff.role === "Admin" ? "destructive" :
                                        staff.role === "Inventory Manager" ? "default" :
                                            staff.role === "Request Handler" ? "secondary" : "outline"
                                } className="whitespace-nowrap">
                                    {staff.role === "Admin" && <Shield className="mr-1 h-3 w-3" />}
                                    {staff.role}
                                </Badge>
                                <div className="flex items-center gap-2 px-2 py-0.5 border rounded-full text-xs bg-muted/50">
                                    <span className={`h-2 w-2 rounded-full ${staff.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                                    <span>{staff.status}</span>
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground pt-1">
                                Last Active: <span className="text-foreground">{new Date(staff.lastActive).toLocaleDateString()}</span>
                            </div>

                            <div className="flex gap-4 pt-2 border-t mt-2">
                                <a href={`mailto:${staff.email}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <Mail className="h-4 w-4" />
                                    <span className="sr-only">Email</span>
                                </a>
                                <a href={`tel:${staff.phone}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                                    <Phone className="h-4 w-4" />
                                    <span className="sr-only">Call</span>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
