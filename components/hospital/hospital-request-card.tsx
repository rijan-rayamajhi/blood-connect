import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BloodRequest } from "@/lib/store/request-store"
import { Calendar, Droplets, Clock, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface HospitalRequestCardProps {
    request: BloodRequest
    onViewTracking?: (id: string) => void
}

export function HospitalRequestCard({ request, onViewTracking }: HospitalRequestCardProps) {
    const urgencyColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        "Critical": "destructive",
        "Urgent": "default",
        "Normal": "secondary"
    }

    const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        "Pending": "outline",
        "Accepted": "default",
        "Rejected": "destructive",
        "Partial": "secondary",
        "Completed": "default"
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
                                <span className="text-xl font-bold">{request.bloodGroup}</span>
                            </div>

                            <div className="sm:hidden flex gap-2">
                                <Badge variant={urgencyColor[request.urgency]} className={cn(request.urgency === 'Critical' && 'animate-pulse')}>
                                    {request.urgency}
                                </Badge>
                                <Badge variant={statusColor[request.status]} className="uppercase text-[10px]">
                                    {request.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center text-sm font-medium text-muted-foreground mt-1">
                            <span>{request.componentType}</span>
                            <span className="mx-2">•</span>
                            <span className="text-foreground font-bold">{request.quantity}</span>
                            <span className="ml-1">Units</span>
                        </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                        <Badge variant={statusColor[request.status]} className="uppercase text-[10px]">
                            {request.status}
                        </Badge>
                        <Badge variant={urgencyColor[request.urgency]} className={cn(request.urgency === 'Critical' && 'animate-pulse')}>
                            {request.urgency}
                        </Badge>
                    </div>
                </div>

                {/* Dates & Action Section */}
                <div className="mt-auto bg-muted/30 border-t p-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div className="flex gap-6 sm:gap-4 justify-between sm:justify-start">
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-semibold leading-none mb-1">Created</span>
                                <span className="text-xs font-medium text-foreground">{request.requestDate}</span>
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-8 bg-border" />
                        <div className="flex gap-2 items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-semibold leading-none mb-1">Required</span>
                                <span className="text-xs font-medium text-foreground">{request.requiredDate}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto shrink-0 bg-background"
                        onClick={() => onViewTracking?.(request.id)}
                    >
                        <Activity className="mr-2 h-4 w-4" />
                        View Tracking
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
