import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BloodRequest, useRequestStore } from "@/lib/store/request-store"
import { Calendar, Droplets, Clock } from "lucide-react"
import { getStatusBadgeVariant, formatRequestStatus } from "@/lib/utils/request-status-map"

interface RequestCardProps {
    request: BloodRequest
    isHospitalView?: boolean
}

export function RequestCard({ request, isHospitalView = false }: RequestCardProps) {
    const updateStatus = useRequestStore((state) => state.updateRequestStatus)

    const urgencyColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        "critical": "destructive",
        "moderate": "default",
        "normal": "secondary"
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg font-bold">{request.hospitalName}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                            <Clock className="mr-1 h-3 w-3" />
                            Requested: {request.requestDate}
                        </CardDescription>
                    </div>
                    <Badge variant={urgencyColor[request.urgency]} className={request.urgency === 'critical' ? 'animate-pulse' : ''}>
                        {request.urgency}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                        <Droplets className="mr-2 h-4 w-4 text-primary" />
                        <span className="font-semibold">{request.bloodGroup}</span>
                        <span className="ml-1 text-muted-foreground">({request.componentType})</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-bold mr-1">{request.quantity}</span>
                        <span className="text-muted-foreground">Units Required</span>
                    </div>
                    <div className="flex items-center col-span-2">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Required by: <span className="font-medium">{request.requiredDate}</span></span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-muted/20 pt-4 pb-4 gap-4">
                <Badge variant={getStatusBadgeVariant(request.status)} className="uppercase text-[10px] w-fit">
                    {formatRequestStatus(request.status)}
                </Badge>

                {request.status === 'sent' && !isHospitalView && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => updateStatus(request.id, 'rejected')}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => updateStatus(request.id, 'partially-accepted')}
                        >
                            Partial
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                            onClick={() => updateStatus(request.id, 'accepted')}
                        >
                            Accept
                        </Button>
                    </div>
                )}
                {request.status === 'accepted' && !isHospitalView && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto border-emerald-600 text-emerald-600 hover:bg-emerald-600/10"
                            onClick={() => updateStatus(request.id, 'collected')}
                        >
                            Mark Collected
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
