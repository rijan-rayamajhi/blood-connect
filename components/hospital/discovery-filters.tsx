"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useDiscoveryStore } from "@/lib/store/discovery-store"
import { useShallow } from "zustand/react/shallow"

export function DiscoveryFilters() {
    const {
        radiusKm, bloodGroup, quantity, maxResponseTime,
        setFilters, resetFilters
    } = useDiscoveryStore(
        useShallow(state => ({
            radiusKm: state.radiusKm,
            bloodGroup: state.bloodGroup,
            quantity: state.quantity,
            maxResponseTime: state.maxResponseTime,
            setFilters: state.setFilters,
            resetFilters: state.resetFilters
        }))
    )

    const hasActiveFilters = radiusKm !== 10 || bloodGroup !== null || quantity !== null || maxResponseTime !== null

    return (
        <div className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* 1. Distance Filter */}
                <div className="space-y-2">
                    <Label htmlFor="distance" className="text-sm font-medium">Distance</Label>
                    <Select
                        value={radiusKm.toString()}
                        onValueChange={(val) => setFilters({ radiusKm: parseInt(val) })}
                    >
                        <SelectTrigger id="distance">
                            <SelectValue placeholder="Select distance" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">Within 5 km</SelectItem>
                            <SelectItem value="10">Within 10 km</SelectItem>
                            <SelectItem value="25">Within 25 km</SelectItem>
                            <SelectItem value="50">Within 50 km</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 2. Blood Group Filter */}
                <div className="space-y-2">
                    <Label htmlFor="blood-group" className="text-sm font-medium">Blood Group</Label>
                    <Select
                        value={bloodGroup || "all"}
                        onValueChange={(val) => setFilters({ bloodGroup: val === "all" ? null : val })}
                    >
                        <SelectTrigger id="blood-group">
                            <SelectValue placeholder="Any Group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Groups</SelectItem>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 3. Quantity Input */}
                <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium">Units Needed</Label>
                    <Input
                        id="quantity"
                        type="number"
                        placeholder="e.g. 2"
                        min={1}
                        value={quantity || ""}
                        onChange={(e) => setFilters({ quantity: e.target.value ? parseInt(e.target.value) : null })}
                    />
                </div>

                {/* 4. Response Time Filter */}
                <div className="space-y-2">
                    <Label htmlFor="response-time" className="text-sm font-medium">Response Time</Label>
                    <Select
                        value={maxResponseTime?.toString() || "immediate"}
                        onValueChange={(val) => setFilters({ maxResponseTime: val === "immediate" ? null : parseInt(val) })}
                    >
                        <SelectTrigger id="response-time">
                            <SelectValue placeholder="Any Time" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="15">Within 15 mins</SelectItem>
                            <SelectItem value="30">Within 30 mins</SelectItem>
                            <SelectItem value="60">Within 1 hour</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {hasActiveFilters && (
                        <Button variant="outline" className="w-full text-muted-foreground hover:text-foreground" onClick={resetFilters} title="Clear Filters">
                            <X className="mr-2 h-4 w-4" />
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
