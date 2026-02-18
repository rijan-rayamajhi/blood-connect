"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
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

export function DiscoveryFilters() {
    const [distance, setDistance] = useState("10")
    const [bloodGroup, setBloodGroup] = useState("")
    const [quantity, setQuantity] = useState("")
    const [responseTime, setResponseTime] = useState("")

    const clearFilters = () => {
        setDistance("10")
        setBloodGroup("")
        setQuantity("")
        setResponseTime("")
    }

    const hasActiveFilters = distance !== "10" || bloodGroup || quantity || responseTime

    return (
        <div className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* 1. Distance Filter */}
                <div className="space-y-2">
                    <Label htmlFor="distance" className="text-sm font-medium">Distance</Label>
                    <Select value={distance} onValueChange={setDistance}>
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
                    <Select value={bloodGroup} onValueChange={setBloodGroup}>
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
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </div>

                {/* 4. Response Time Filter */}
                <div className="space-y-2">
                    <Label htmlFor="response-time" className="text-sm font-medium">Response Time</Label>
                    <Select value={responseTime} onValueChange={setResponseTime}>
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
                    <Button className="flex-1">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                    {hasActiveFilters && (
                        <Button variant="outline" size="icon" onClick={clearFilters} title="Clear Filters">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
