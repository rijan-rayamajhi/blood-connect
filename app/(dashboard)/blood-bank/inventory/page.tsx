"use client"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddInventoryModal } from "@/components/dashboard/inventory/add-inventory-modal"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "@/components/dashboard/inventory/columns"
import { TableSkeleton, CardListSkeleton } from "@/components/ui/skeletons"
import { EmptyState } from "@/components/ui/empty-state"

import { useInventoryStore } from "@/lib/store/inventory-store"

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const { items, isLoading } = useInventoryStore()

    // Simulate loading on mount (optional, if we want to show skeleton initially)
    // const [isPageLoading, setIsPageLoading] = useState(true)
    // useEffect(() => { setTimeout(() => setIsPageLoading(false), 1000) }, [])

    // Simple filter logic for demonstration (DataTable handles most, but for external filters)
    const filteredData = items.filter(item =>
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.component.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventory</h1>
                        <p className="text-muted-foreground mt-1">Manage blood units and components.</p>
                    </div>
                    <Button disabled>Add Item</Button>
                </div>
                <Card>
                    <CardContent className="p-4">
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    </CardContent>
                </Card>
                <div className="hidden md:block">
                    <TableSkeleton />
                </div>
                <div className="md:hidden">
                    <CardListSkeleton />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground mt-1">Manage blood units and components.</p>
                </div>
                <AddInventoryModal />
            </div>

            {/* Filter Bar */}
            <Card>
                <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Unit ID or Component..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Select>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Blood Group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                <SelectItem value="a_pos">A+</SelectItem>
                                <SelectItem value="a_neg">A-</SelectItem>
                                <SelectItem value="b_pos">B+</SelectItem>
                                <SelectItem value="b_neg">B-</SelectItem>
                                <SelectItem value="o_pos">O+</SelectItem>
                                <SelectItem value="o_neg">O-</SelectItem>
                                <SelectItem value="ab_pos">AB+</SelectItem>
                                <SelectItem value="ab_neg">AB-</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Component" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Components</SelectItem>
                                <SelectItem value="whole">Whole Blood</SelectItem>
                                <SelectItem value="rbc">Packed RBC</SelectItem>
                                <SelectItem value="platelets">Platelets</SelectItem>
                                <SelectItem value="plasma">Plasma</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="w-full sm:w-auto md:hidden">
                            <Filter className="mr-2 h-4 w-4" />
                            More Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Inventory List */}
            {filteredData.length === 0 ? (
                <EmptyState
                    title="No Items Found"
                    description={searchTerm ? `No items match "${searchTerm}"` : "Your inventory is empty."}
                    actionLabel={searchTerm ? "Clear Search" : undefined}
                    onAction={searchTerm ? () => setSearchTerm("") : undefined}
                />
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <DataTable columns={columns} data={filteredData} searchKey="id" />
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden grid gap-4">
                        {filteredData.map((item) => (
                            <Card key={item.id} className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2 p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-base font-bold">{item.id}</CardTitle>
                                            <div className="text-sm text-muted-foreground mt-1 truncate max-w-[150px]">{item.component} • {item.quantity}ml</div>
                                        </div>
                                        <Badge variant="outline" className="font-bold shrink-0">{item.group}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm space-y-3 p-4 pt-0">
                                    <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs uppercase tracking-wide font-semibold mt-2">
                                        <div>Collection</div>
                                        <div className="text-right">Expires</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 font-medium">
                                        <div>{item.collectionDate}</div>
                                        <div className={cn("text-right", new Date(item.expiryDate) < new Date(new Date().setDate(new Date().getDate() + 7)) ? "text-amber-600" : "")}>
                                            {item.expiryDate}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-3 border-t mt-3">
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "font-medium",
                                                item.status === 'Available' && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 dark:bg-emerald-500/20 dark:text-emerald-400",
                                                item.status === 'Reserved' && "bg-amber-100 text-amber-700 hover:bg-amber-100/80 dark:bg-amber-500/20 dark:text-amber-400",
                                                item.status === 'Discarded' && "bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-500/20 dark:text-red-400"
                                            )}
                                        >
                                            {item.status}
                                        </Badge>
                                        <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-muted">
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
