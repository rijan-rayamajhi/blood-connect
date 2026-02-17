"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryItem, BloodGroup } from "@/lib/store/inventory-store"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

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
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Inventory Levels</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
