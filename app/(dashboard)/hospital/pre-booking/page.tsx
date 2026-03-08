"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar as CalendarIcon, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { PreBookingCard, PreBookingItem } from "@/components/hospital/prebooking-card"
import { CreatePreBookingModal, PreBookingFormValues } from "@/components/hospital/create-pre-booking-modal"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"
import { usePreBookingStore, PreBooking } from "@/lib/store/pre-booking-store"
import { useAuthStore } from "@/lib/store/auth-store"

// Convert a DB PreBooking to the card's PreBookingItem type
function toCardItem(b: PreBooking): PreBookingItem {
    return {
        id: b.id,
        bloodGroup: b.bloodGroup,
        componentType: b.componentType,
        quantity: b.quantity,
        scheduledDate: b.scheduledDate,
        status: b.status,
        notes: b.notes,
        autoConvert: b.autoConvert,
    }
}

// Convert a DB ISO scheduled_date to the datetime-local input format
function toDatetimeLocal(isoString: string): string {
    try {
        const d = new Date(isoString)
        // Format: YYYY-MM-DDTHH:mm
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch {
        return ''
    }
}

export default function PreBookingPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingBooking, setEditingBooking] = useState<PreBooking | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const user = useAuthStore((s) => s.user)
    const { bookings, isLoading, fetchPreBookings, createPreBooking, updatePreBooking, cancelPreBooking, subscribeRealtime, unsubscribeRealtime } = usePreBookingStore()

    useEffect(() => {
        fetchPreBookings()

        if (user?.organizationId) {
            subscribeRealtime(user.organizationId)
        }

        return () => {
            unsubscribeRealtime()
        }
    }, [user?.organizationId, fetchPreBookings, subscribeRealtime, unsubscribeRealtime])

    // Split bookings into upcoming (scheduled) and history (fulfilled/cancelled)
    const upcomingBookings = bookings.filter((b) => b.status === "scheduled")
    const historyBookings = bookings.filter((b) => b.status !== "scheduled")

    const handleCreateSubmit = async (data: PreBookingFormValues) => {
        setIsSaving(true)
        try {
            await createPreBooking({
                bloodGroup: data.bloodGroup,
                componentType: data.componentType,
                quantity: data.quantity,
                scheduledDate: new Date(data.scheduledDate).toISOString(),
                notes: data.notes || undefined,
                autoConvert: data.autoConvert,
            })
            toast.success("Pre-Booking Created", {
                description: `Scheduled ${data.quantity} units of ${data.bloodGroup} ${data.componentType}.`,
                duration: 5000,
            })
            setIsCreateModalOpen(false)
        } catch (err) {
            toast.error("Failed to create pre-booking", {
                description: err instanceof Error ? err.message : "An error occurred.",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleEditSubmit = async (data: PreBookingFormValues) => {
        if (!editingBooking) return
        setIsSaving(true)
        try {
            await updatePreBooking(editingBooking.id, {
                bloodGroup: data.bloodGroup,
                componentType: data.componentType,
                quantity: data.quantity,
                scheduledDate: new Date(data.scheduledDate).toISOString(),
                notes: data.notes ?? undefined,
                autoConvert: data.autoConvert,
            })
            toast.success("Pre-Booking Updated", {
                description: `Booking for ${data.bloodGroup} ${data.componentType} has been updated.`,
                duration: 4000,
            })
            setEditingBooking(null)
        } catch (err) {
            toast.error("Failed to update pre-booking", {
                description: err instanceof Error ? err.message : "An error occurred.",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = async (id: string) => {
        try {
            await cancelPreBooking(id)
            toast.success("Pre-Booking Cancelled", {
                description: "The booking has been cancelled.",
                duration: 4000,
            })
        } catch (err) {
            toast.error("Failed to cancel pre-booking", {
                description: err instanceof Error ? err.message : "An error occurred.",
            })
        }
    }

    const handleEdit = (booking: PreBookingItem) => {
        const full = bookings.find((b) => b.id === booking.id)
        if (full) setEditingBooking(full)
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

                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchPreBookings()}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button className="flex-1 sm:flex-none" onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Pre-Booking
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Scheduled Requests List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upcoming */}
                    <Card className="min-h-[400px]">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Upcoming Scheduled Requests</CardTitle>
                                    <CardDescription>Your confirmed future deliveries</CardDescription>
                                </div>
                                {upcomingBookings.length > 0 && (
                                    <Badge variant="default">{upcomingBookings.length}</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className={upcomingBookings.length > 0 ? "p-4 sm:p-6 pt-0" : "p-6"}>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-[250px]">
                                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : upcomingBookings.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {upcomingBookings.map((booking) => (
                                        <PreBookingCard
                                            key={booking.id}
                                            booking={toCardItem(booking)}
                                            onEdit={handleEdit}
                                            onCancel={handleCancel}
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

                    {/* History */}
                    {historyBookings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Booking History</CardTitle>
                                <CardDescription>Fulfilled and cancelled bookings</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                                <div className="flex flex-col gap-4">
                                    {historyBookings.map((booking) => (
                                        <PreBookingCard
                                            key={booking.id}
                                            booking={toCardItem(booking)}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
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

            {/* Create Modal */}
            <CreatePreBookingModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSubmit={handleCreateSubmit}
                isLoading={isSaving}
                mode="create"
            />

            {/* Edit Modal */}
            <CreatePreBookingModal
                open={!!editingBooking}
                onOpenChange={(open) => { if (!open) setEditingBooking(null) }}
                onSubmit={handleEditSubmit}
                isLoading={isSaving}
                mode="edit"
                initialValues={editingBooking ? {
                    bloodGroup: editingBooking.bloodGroup,
                    componentType: editingBooking.componentType,
                    quantity: editingBooking.quantity,
                    scheduledDate: toDatetimeLocal(editingBooking.scheduledDate),
                    notes: editingBooking.notes ?? "",
                    autoConvert: editingBooking.autoConvert,
                } : undefined}
            />
        </div>
    )
}
