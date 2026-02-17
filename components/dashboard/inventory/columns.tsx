"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useState } from "react"
import { InventoryItem } from "@/lib/store/inventory-store"

export const columns: ColumnDef<InventoryItem>[] = [
    {
        accessorKey: "id",
        header: "Unit ID",
        cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "group",
        header: "Blood Group",
        cell: ({ row }) => (
            <Badge variant="outline" className="font-bold">
                {row.getValue("group")}
            </Badge>
        ),
    },
    {
        accessorKey: "component",
        header: "Component",
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Volume (ml)
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="pl-4">{row.getValue("quantity")}</div>,

    },
    {
        accessorKey: "collectionDate",
        header: "Collection Date",
    },
    {
        accessorKey: "expiryDate",
        header: "Expiry Date",
        cell: ({ row }) => {
            const date = row.getValue("expiryDate") as string
            const isNearExpiry = new Date(date) < new Date(new Date().setDate(new Date().getDate() + 7))
            return (
                <div className={isNearExpiry ? "text-amber-600 font-medium" : ""}>
                    {date}
                </div>
            )
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge
                    variant={
                        status === 'Available' ? 'default' :
                            status === 'Reserved' ? 'secondary' : 'destructive'
                    }
                    className={
                        status === 'Available' ? 'bg-emerald-500 hover:bg-emerald-600' :
                            status === 'Reserved' ? 'bg-amber-500 hover:bg-amber-600' : ''
                    }
                >
                    {status}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const item = row.original
            // We need to access the store here since this is a functional component
            // But hooks can only be used in components. The cell function is a component content.
            // However, TanStack table cells are rendered as components.
            return <ActionCell item={item} />
        },
    },
]

import { useInventoryStore } from "@/lib/store/inventory-store"
import { toast } from "sonner"
import { Trash2, Edit, Eye, Copy } from "lucide-react"

function ActionCell({ item }: { item: InventoryItem }) {
    const deleteItem = useInventoryStore((state) => state.deleteItem)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteItem(item.id)
            toast.success("Item deleted successfully")
        } catch {
            toast.error("Failed to delete item")
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
                        navigator.clipboard.writeText(item.id)
                        toast.success("Unit ID copied to clipboard")
                    }}
                >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Unit ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit unit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete unit"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
