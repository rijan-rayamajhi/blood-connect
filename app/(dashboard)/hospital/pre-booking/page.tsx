"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react"
import { PreBookingCard, PreBookingItem } from "@/components/hospital/prebooking-card"
import { CreatePreBookingModal, PreBookingFormValues } from "@/components/hospital/create-pre-booking-modal"
import { EmptyState } from "@/components/ui/empty-state"
import { useState } from "react"
import { toast } from "sonner"

// --- Mock Data ---
const mockPreBookings: PreBookingItem[] = [
    {
        id: "PB-1001",
        bloodGroup: "O+",
        componentType: "Whole Blood",
        quantity: 15,
        scheduledDate: "Oct 24, 2024 - 10:00 AM",
        status: "Upcoming"
    },
    {
        id: "PB-1002",
        bloodGroup: "A-",
        componentType: "Packed RBC",
        quantity: 5,
        scheduledDate: "Oct 26, 2024 - 02:30 PM",
        status: "Upcoming"
    },
    {
        id: "PB-1003",
        bloodGroup: "B+",
        componentType: "Platelets",
        quantity: 10,
        scheduledDate: "Nov 02, 2024 - 09:15 AM",
        status: "In Progress"
    }
]

export default function PreBookingPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const handleCreateSubmit = (data: PreBookingFormValues) => {
        console.log("Pre-booking simulation data:", data)
        toast.success("Pre-Booking Created", {
            description: `Successfully scheduled ${data.quantity} units of ${data.bloodGroup} ${data.componentType}.`,
            duration: 5000
        })
        setIsCreateModalOpen(false)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Page Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pre-Booking</h1>
                    <p className="text-muted-foreground">
                        Schedule and manage future blood unit requirements.
                    </p>
                </div>

                {/* Primary Action Button */}
                <Button className="w-full sm:w-auto" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Pre-Booking
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Scheduled Requests List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full min-h-[400px]">
                        <CardHeader>
                            <CardTitle>Upcoming Scheduled Requests</CardTitle>
                            <CardDescription>Your confirmed future deliveries</CardDescription>
                        </CardHeader>
                        <CardContent className={mockPreBookings.length > 0 ? "p-4 sm:p-6" : "p-6"}>
                            {mockPreBookings.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {mockPreBookings.map((booking) => (
                                        <PreBookingCard
                                            key={booking.id}
                                            booking={booking}
                                            onEdit={(id) => console.log("Edit booking", id)}
                                            onCancel={(id) => console.log("Cancel booking", id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center py-10 min-h-[250px]">
                                    <EmptyState
                                        icon={Clock}
                                        title="No scheduled blood requests"
                                        description="You haven't scheduled any future blood deliveries yet."
                                        actionLabel="Schedule Now"
                                        onAction={() => setIsCreateModalOpen(true)}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Calendar Placeholder */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="h-full min-h-[400px]">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                Delivery Calendar
                            </CardTitle>
                            <CardDescription>Visual schedule of confirmed drops</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center text-center h-[calc(100%-80px)]">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <CalendarIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">Calendar View Coming Soon</h3>
                            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto flex items-center justify-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                                <span>A visual representation of your schedule goes here.</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CreatePreBookingModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSubmit={handleCreateSubmit}
            />
        </div>
    )
}
