"use client"

import { Donor } from "@/lib/store/donor-store"
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
import { useDonorStore } from "@/lib/store/donor-store"
import { toast } from "sonner"
import { useState } from "react"

export const DonorActions = ({ donor }: { donor: Donor }) => {
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
