"use client"

import { Staff } from "@/lib/store/staff-store"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useStaffStore } from "@/lib/store/staff-store"

export const StaffActions = ({ staff }: { staff: Staff }) => {
    const deleteStaff = useStaffStore((state) => state.deleteStaff)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(staff.email)}
                >
                    Copy Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => deleteStaff(staff.id)}>
                    Remove Staff
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
