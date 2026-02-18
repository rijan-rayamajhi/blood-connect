"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryItem, BloodGroup } from "@/lib/store/inventory-store"


interface InventoryChartsProps {
    items: InventoryItem[]
}

export function InventoryCharts({ items }: InventoryChartsProps) {
    const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

    // Transform inventory items into chart data
    // Counts available units per blood group and assigns color based on stock level
    const data = bloodGroups.map(group => {
        const count = items.filter(i => i.group === group && i.status === "Available").length
        return {
            name: group,
            count: count,
            fill: count < 5 ? "#ef4444" : count < 15 ? "#f59e0b" : "#10b981" // red-500, amber-500, emerald-500
        }
    })

    return (
        <Card className="col-span-full lg:col-span-4">
            <CardHeader className="pb-2">
                <CardTitle>Blood Stock Levels</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {data.map((item) => (
                        <div
                            key={item.name}
                            className="flex flex-col items-center justify-center p-3 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow min-h-[100px]"
                        >
                            <div className="text-sm font-medium text-muted-foreground">{item.name}</div>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold my-1" style={{ color: item.fill }}>
                                {item.count}
                            </div>
                            <div className="text-xs text-muted-foreground text-center px-1">
                                {item.count < 5 ? "Critical" : item.count < 15 ? "Low" : "Good"}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
