import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarClock, Droplets, Edit, XCircle } from "lucide-react"

export interface PreBookingItem {
    id: string
    bloodGroup: string
    componentType: string
    quantity: number
    scheduledDate: string
    status: "Upcoming" | "In Progress" | "Completed" | "Cancelled"
}

interface PreBookingCardProps {
    booking: PreBookingItem
    onEdit?: (id: string) => void
    onCancel?: (id: string) => void
}

export function PreBookingCard({ booking, onEdit, onCancel }: PreBookingCardProps) {
    const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        "Upcoming": "default",
        "In Progress": "secondary",
        "Completed": "outline",
        "Cancelled": "destructive"
    }

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
                                <Badge variant={statusColor[booking.status]} className="uppercase text-[10px]">
                                    {booking.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center text-sm font-medium text-muted-foreground mt-1">
                            <span>{booking.componentType}</span>
                            <span className="mx-2">•</span>
                            <span className="text-foreground font-bold">{booking.quantity}</span>
                            <span className="ml-1">Units</span>
                        </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                        <Badge variant={statusColor[booking.status]} className="uppercase text-[10px]">
                            {booking.status}
                        </Badge>
                    </div>
                </div>

                {/* Date & Action Section */}
                <div className="mt-auto bg-muted/30 border-t p-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <CalendarClock className="h-4 w-4 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-semibold leading-none mb-1">Scheduled For</span>
                            <span className="text-xs font-medium text-foreground">{booking.scheduledDate}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-none bg-background"
                            onClick={() => onEdit?.(booking.id)}
                            disabled={booking.status === "Cancelled" || booking.status === "Completed"}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1 sm:flex-none"
                            onClick={() => onCancel?.(booking.id)}
                            disabled={booking.status === "Cancelled" || booking.status === "Completed"}
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
