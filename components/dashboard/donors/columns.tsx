"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Donor } from "@/lib/store/donor-store"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail } from "lucide-react"


import { DonorActions } from "./donor-actions"


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
