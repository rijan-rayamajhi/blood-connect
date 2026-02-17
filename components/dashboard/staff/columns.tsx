"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Staff } from "@/lib/store/staff-store"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Mail, Phone, Shield } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Separate component for Actions to use hook
const StaffActions = ({ staff }: { staff: Staff }) => {
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

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

export const columns: ColumnDef<Staff>[] = [
    {
        accessorKey: "name",
        header: "Staff Member",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${row.original.name}`} alt={row.original.name} />
                        <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{row.getValue("name")}</span>
                        <span className="text-xs text-muted-foreground">{row.original.email}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string
            const variant =
                role === "Admin" ? "destructive" :
                    role === "Inventory Manager" ? "default" :
                        role === "Request Handler" ? "secondary" : "outline"

            return (
                <Badge variant={variant} className="whitespace-nowrap">
                    {role === "Admin" && <Shield className="mr-1 h-3 w-3" />}
                    {role}
                </Badge>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const isActive = status === "Active"
            return (
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                    <span className="text-sm text-muted-foreground">{status}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "lastActive",
        header: "Last Active",
        cell: ({ row }) => {
            const date = new Date(row.getValue("lastActive"))
            return <div className="text-muted-foreground text-sm">{date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        }
    },
    {
        accessorKey: "contact",
        header: "Contact",
        cell: ({ row }) => {
            return (
                <div className="flex gap-2">
                    <a href={`mailto:${row.original.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="h-4 w-4" />
                    </a>
                    <a href={`tel:${row.original.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="h-4 w-4" />
                    </a>
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <StaffActions staff={row.original} />
    },
]
