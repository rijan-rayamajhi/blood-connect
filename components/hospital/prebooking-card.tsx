import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarClock, Droplets, Edit, XCircle } from "lucide-react"
import { PreBookingStatus } from "@/lib/store/pre-booking-store"

export interface PreBookingItem {
    id: string
    bloodGroup: string
    componentType: string
    quantity: number
    scheduledDate: string  // ISO string from DB
    status: PreBookingStatus
    notes?: string | null
    autoConvert?: boolean
}

interface PreBookingCardProps {
    booking: PreBookingItem
    onEdit?: (booking: PreBookingItem) => void
    onCancel?: (id: string) => void
}

function formatScheduledDate(isoString: string): string {
    try {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(new Date(isoString))
    } catch {
        return isoString
    }
}

const STATUS_BADGE_VARIANT: Record<PreBookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
    scheduled: "default",
    fulfilled: "outline",
    cancelled: "destructive",
}

const STATUS_LABEL: Record<PreBookingStatus, string> = {
    scheduled: "Scheduled",
    fulfilled: "Fulfilled",
    cancelled: "Cancelled",
}

export function PreBookingCard({ booking, onEdit, onCancel }: PreBookingCardProps) {
    const isActive = booking.status === "scheduled"

    return (
        <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md border-muted-foreground/20">
            <CardContent className="p-0 flex flex-col h-full">
                {/* Header Section */}
                <div className="p-5 pb-4 flex flex-col sm:flex-row justify-between gap-4 items-start">
                    <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex justify-between sm:justify-start items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <Droplets className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-xl font-bold">{booking.bloodGroup}</span>
                            </div>

                            <div className="sm:hidden flex gap-2">
                                <Badge
                                    variant={STATUS_BADGE_VARIANT[booking.status]}
                                    className="uppercase text-[10px]"
                                >
                                    {STATUS_LABEL[booking.status]}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center text-sm font-medium text-muted-foreground mt-1">
                            <span>{booking.componentType}</span>
                            <span className="mx-2">•</span>
                            <span className="text-foreground font-bold">{booking.quantity}</span>
                            <span className="ml-1">Units</span>
                            {booking.autoConvert && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span className="text-xs text-amber-500 font-medium">Auto-convert on</span>
                                </>
                            )}
                        </div>

                        {booking.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{booking.notes}</p>
                        )}
                    </div>

                    <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                        <Badge
                            variant={STATUS_BADGE_VARIANT[booking.status]}
                            className="uppercase text-[10px]"
                        >
                            {STATUS_LABEL[booking.status]}
                        </Badge>
                    </div>
                </div>

                {/* Date & Action Section */}
                <div className="mt-auto bg-muted/30 border-t p-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <CalendarClock className="h-4 w-4 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-semibold leading-none mb-1">Scheduled For</span>
                            <span className="text-xs font-medium text-foreground">
                                {formatScheduledDate(booking.scheduledDate)}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none bg-background"
                            onClick={() => onEdit?.(booking)}
                            disabled={!isActive}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => onCancel?.(booking.id)}
                            disabled={!isActive}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
