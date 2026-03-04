"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useRequestStore } from "@/lib/store/request-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RequestTimeline } from "@/components/requests/request-timeline"
import { ChevronLeft, Download, XCircle, Droplets, Calendar } from "lucide-react"
import { toast } from "sonner"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { formatRequestStatus, getStatusBadgeVariant } from "@/lib/utils/request-status-map"

export default function RequestTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { requests, updateRequestStatus } = useRequestStore()

    const request = requests.find(r => r.id === id)

    if (!request) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <EmptyState
                    icon={XCircle}
                    title="Request Not Found"
                    description="The blood request you are looking for does not exist or has been removed."
                    actionLabel="Back to Requests"
                    onAction={() => router.push("/hospital/requests")}
                />
            </div>
        )
    }

    const urgencyColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        "critical": "destructive",
        "moderate": "default",
        "normal": "secondary"
    }

    const handleDownloadReport = () => {
        toast.success("Downloading Report", {
            description: `Generating PDF medical report for ${request.id}.`
        })
    }

    const handleCancelRequest = () => {
        toast.error("Request Cancelled", {
            description: `You have successfully cancelled ${request.id}.`
        })
        updateRequestStatus(request.id, "cancelled")
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
            {/* Header / Nav */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/hospital/requests")}
                        className="-ml-2"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            {request.id}
                            <Badge variant={getStatusBadgeVariant(request.status)} className="uppercase text-xs mt-1">
                                {formatRequestStatus(request.status)}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground text-sm">Follow your request&apos;s live status.</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleDownloadReport} className="flex-1 sm:flex-none">
                        <Download className="h-4 w-4 mr-2" />
                        Report
                    </Button>
                    {(request.status === "sent" || request.status === "accepted" || request.status === "partially-accepted") && (
                        <Button variant="destructive" size="sm" onClick={handleCancelRequest} className="flex-1 sm:flex-none">
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Summary Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Request Summary</CardTitle>
                            <CardDescription>Clinical details of the required units</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Urgency</span>
                                <div>
                                    <Badge variant={urgencyColor[request.urgency]} className={cn("text-sm", request.urgency === 'critical' && 'animate-pulse')}>
                                        {request.urgency}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Blood Required</span>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <Droplets className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-2xl font-bold">{request.bloodGroup}</span>
                                    <span className="text-muted-foreground font-medium">({request.componentType})</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">Quantity</span>
                                    <div className="font-semibold text-lg">{request.quantity} <span className="text-sm font-normal text-muted-foreground">Units</span></div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase">Target Date</span>
                                    <div className="font-semibold text-sm flex items-center mt-1">
                                        <Calendar className="h-3 w-3 mr-1.5 text-muted-foreground" />
                                        {request.requiredDate}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Fulfillment Timeline</CardTitle>
                            <CardDescription>Track the journey of your requested units</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {request.status === "rejected" || request.status === "cancelled" ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                                        <XCircle className="h-6 w-6 text-destructive" />
                                    </div>
                                    <h3 className="text-lg font-bold text-destructive mb-2">Request {formatRequestStatus(request.status)}</h3>
                                    <p className="text-muted-foreground max-w-sm">
                                        This request was {formatRequestStatus(request.status).toLowerCase()} by the blood bank or your hospital. Fulfillment has stopped.
                                    </p>
                                    <div className="mt-8 text-left border rounded-md p-4 w-full bg-muted/20">
                                        <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase">Prior History</h4>
                                        <RequestTimeline timeline={request.timeline} />
                                    </div>
                                </div>
                            ) : (
                                <RequestTimeline timeline={request.timeline} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
