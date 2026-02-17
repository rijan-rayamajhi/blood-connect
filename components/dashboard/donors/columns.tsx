"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Donor } from "@/lib/store/donor-store"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDonorStore } from "@/lib/store/donor-store"

// Separate component for Actions to use hook
import { toast } from "sonner"
import { useState } from "react"

const DonorActions = ({ donor }: { donor: Donor }) => {
    const deleteDonor = useDonorStore((state) => state.deleteDonor)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteDonor(donor.id)
            toast.success("Donor deleted successfully")
        } catch {
            toast.error("Failed to delete donor")
        } finally {
            setIsDeleting(false)
        }
    }

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
                    onClick={() => {
                        navigator.clipboard.writeText(donor.contactNumber)
                        toast.success("Phone number copied")
                    }}
                >
                    Copy Phone
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        navigator.clipboard.writeText(donor.email)
                        toast.success("Email copied")
                    }}
                >
                    Copy Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete Donor"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export const columns: ColumnDef<Donor>[] = [
    {
        accessorKey: "fullName",
        header: "Name",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{row.getValue("fullName")}</span>
                    <span className="text-xs text-muted-foreground">{row.original.id}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "bloodGroup",
        header: "Group",
        cell: ({ row }) => {
            return (
                <Badge variant="outline" className="font-bold">
                    {row.getValue("bloodGroup")}
                </Badge>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const variant =
                status === "Available" ? "default" : // Greenish handled by class or default
                    status === "Ineligible" ? "destructive" :
                        "secondary"

            return (
                <Badge variant={variant} className={status === "Available" ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "lastDonationDate",
        header: "Last Donation",
    },
    {
        accessorKey: "totalDonations",
        header: "Donations",
        cell: ({ row }) => <div className="text-center font-medium">{row.getValue("totalDonations")}</div>
    },
    {
        accessorKey: "contact",
        header: "Contact",
        cell: ({ row }) => {
            return (
                <div className="flex gap-2">
                    <a href={`tel:${row.original.contactNumber}`} className="text-muted-foreground hover:text-primary">
                        <Phone className="h-4 w-4" />
                    </a>
                    <a href={`mailto:${row.original.email}`} className="text-muted-foreground hover:text-primary">
                        <Mail className="h-4 w-4" />
                    </a>
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <DonorActions donor={row.original} />
    },
]
