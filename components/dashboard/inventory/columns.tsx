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

import { useState, useMemo } from "react"
import { InventoryItem, useInventoryStore } from "@/lib/store/inventory-store"
import { getInventoryBadgeVariant, getInventoryBadgeClass } from "@/lib/utils/inventory-status-map"
import { getRecommendedFIFOUnit } from "@/lib/utils/fifo-hook"

export const columns: ColumnDef<InventoryItem>[] = [
    {
        accessorKey: "id",
        header: "Unit ID",
        cell: ({ row, table }) => {
            const id = row.getValue("id") as string
            const items = table.options.data as InventoryItem[]
            const status = row.original.status
            const recommendedId = getRecommendedFIFOUnit(items)
            const isRecommended = id === recommendedId && status !== "expired"

            return (
                <div className={`flex items-center gap-2 ${status === "expired" ? "opacity-50" : ""}`}>
                    <span className="font-medium">{id}</span>
                    {isRecommended && (
                        <Badge variant="outline" className="text-[10px] h-5 border-amber-500 text-amber-600 bg-amber-50">
                            FIFO Recommended
                        </Badge>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "bloodGroup",
        header: "Blood Group",
        cell: ({ row }) => (
            <Badge variant="outline" className="font-bold">
                {row.getValue("bloodGroup")}
            </Badge>
        ),
    },
    {
        accessorKey: "componentType",
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
            const status = row.original.status
            const isNearExpiry = status === "near-expiry"
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
            const status = row.original.status
            const reservedFor = row.original.reservedForRequestId

            return (
                <div className={`flex flex-col gap-1 items-start ${status === "expired" ? "opacity-50" : ""}`}>
                    <Badge variant={getInventoryBadgeVariant(status)} className={`uppercase text-[10px] ${getInventoryBadgeClass(status)}`}>
                        {status.replace('-', ' ')}
                    </Badge>
                    {status === "reserved" && reservedFor && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            For: {reservedFor}
                        </span>
                    )}
                </div>
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

import { toast } from "sonner"
import { Trash2, Edit, Eye, Copy, Ban } from "lucide-react"

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
