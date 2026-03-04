"use client"

import * as React from "react"
import { useRequestStore } from "@/lib/store/request-store"
import { useSystemConfigStore } from "@/lib/store/system-config-store"
import { useShallow } from "zustand/react/shallow"
import { RequestStatus, RequestUrgency } from "@/types/request"
import {
    AlertTriangle,
    Clock,
    Search,
    Activity,
    ChevronRight,
    ShieldAlert,
    MoreVertical,
    Edit2,
    Ban,
    Zap
} from "lucide-react"

import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAdminRegistrationStore } from "@/lib/store/admin-registration-store"
import { toast } from "sonner"

// Helper format function (since we saw date-fns issues previously, but we'll try to use a native approach if date-fns fails)
const formatDateTimeNative = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    }).format(new Date(timestamp))
}

const getUrgencyBadgeVariant = (urgency: RequestUrgency) => {
    switch (urgency) {
        case "critical": return "destructive"
        case "moderate": return "warning"
        default: return "secondary"
    }
}

const getStatusBadgeVariant = (status: RequestStatus) => {
    switch (status) {
        case "collected": return "success"
        case "accepted":
        case "partially-accepted": return "default" // primary
        case "rejected":
        case "cancelled": return "destructive"
        default: return "secondary"
    }
}

export function AdminMonitoringClient() {
    const { requests, adminOverrideStatus, adminEscalateRequest } = useRequestStore(useShallow(state => ({
        requests: state.requests,
        adminOverrideStatus: state.adminOverrideStatus,
        adminEscalateRequest: state.adminEscalateRequest
    })))

    const { adminForceSuspend } = useAdminRegistrationStore(useShallow(state => ({
        adminForceSuspend: state.adminForceSuspend
    })))

    const { config } = useSystemConfigStore(useShallow(state => ({
        config: state.config
    })))

    // Filters state
    const [statusFilter, setStatusFilter] = React.useState<RequestStatus | "all">("all")
    const [urgencyFilter, setUrgencyFilter] = React.useState<RequestUrgency | "all">("all")
    const [hospitalSearch, setHospitalSearch] = React.useState("")
    const [showStuckOnly, setShowStuckOnly] = React.useState(false)

    // Drawer & Modal state
    const [selectedRequestId, setSelectedRequestId] = React.useState<string | null>(null)
    const [overrideModalReqId, setOverrideModalReqId] = React.useState<string | null>(null)
    const [escalateModalReqId, setEscalateModalReqId] = React.useState<string | null>(null)
    const [suspendModalOrgId, setSuspendModalOrgId] = React.useState<string | null>(null)

    // Override Form state
    const [overrideStatus, setOverrideStatus] = React.useState<RequestStatus>("sent")
    const [overrideReason, setOverrideReason] = React.useState("")

    // Suspend Form state
    const [suspendReason, setSuspendReason] = React.useState("")

    const selectedRequest = React.useMemo(() =>
        requests.find(r => r.id === selectedRequestId),
        [requests, selectedRequestId])

    const now = Date.now()

    // Process data with memoization
    const processedRequests = React.useMemo(() => {
        return requests.map(req => {
            // Logic for "Stuck" (Part 4)
            let isStuck = false
            if (req.status === "sent") {
                const sentEvent = req.timeline?.find(t => t.status === "sent")
                if (sentEvent && (now - sentEvent.timestamp) > config.stuckRequestThresholdMinutes * 60 * 1000) {
                    isStuck = true
                }
            }

            // Logic for "Escalation Required" (Part 4)
            let needsEscalation = isStuck
            if (req.urgency === "critical" && req.status === "sent") {
                const sentEvent = req.timeline?.find(t => t.status === "sent")
                if (sentEvent && (now - sentEvent.timestamp) > config.emergencyEscalationMinutes * 60 * 1000) {
                    needsEscalation = true
                }
            }

            return {
                ...req,
                isStuck,
                needsEscalation
            }
        }).filter(req => {
            // Apply filters
            if (statusFilter !== "all" && req.status !== statusFilter) return false
            if (urgencyFilter !== "all" && req.urgency !== urgencyFilter) return false
            if (hospitalSearch && !req.hospitalName.toLowerCase().includes(hospitalSearch.toLowerCase())) return false
            if (showStuckOnly && !req.isStuck) return false
            return true
        }).sort((a, b) => {
            // Sort needsEscalation first, then by latest request time
            if (a.needsEscalation && !b.needsEscalation) return -1
            if (!a.needsEscalation && b.needsEscalation) return 1
            const aTime = new Date(a.requestDate).getTime()
            const bTime = new Date(b.requestDate).getTime()
            return bTime - aTime
        })
    }, [requests, statusFilter, urgencyFilter, hospitalSearch, showStuckOnly, now, config.stuckRequestThresholdMinutes, config.emergencyEscalationMinutes])

    // Handlers
    const handleOverrideSubmit = () => {
        if (!overrideModalReqId || !overrideReason.trim()) {
            toast.error("Please provide a valid override reason.")
            return
        }
        adminOverrideStatus(overrideModalReqId, overrideStatus, overrideReason)
        toast.success(`Request overridden to ${overrideStatus}`)
        setOverrideModalReqId(null)
        setOverrideReason("")
    }

    const handleEscalateConfirm = () => {
        if (!escalateModalReqId) return
        adminEscalateRequest(escalateModalReqId)
        toast.success("Request has been escalated")
        setEscalateModalReqId(null)
    }

    const handleSuspendConfirm = () => {
        if (!suspendModalOrgId || !suspendReason.trim()) {
            toast.error("Please provide a suspension reason.")
            return
        }
        adminForceSuspend(suspendModalOrgId, suspendReason)
        toast.warning("Organization has been forcefully suspended")
        setSuspendModalOrgId(null)
        setSuspendReason("")
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
                <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search hospitals..."
                        className="pl-9 bg-background"
                        value={hospitalSearch}
                        onChange={(e) => setHospitalSearch(e.target.value)}
                    />
                </div>

                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequestStatus | "all")}>
                    <SelectTrigger className="w-[160px] bg-background">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="collected">Collected</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as RequestUrgency | "all")}>
                    <SelectTrigger className="w-[160px] bg-background">
                        <SelectValue placeholder="Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Urgencies</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 bg-background px-3 rounded-md border">
                    <Switch
                        id="stuck-mode"
                        checked={showStuckOnly}
                        onCheckedChange={setShowStuckOnly}
                    />
                    <Label htmlFor="stuck-mode" className="text-sm font-medium whitespace-nowrap">
                        Stuck Only
                    </Label>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Request ID</TableHead>
                            <TableHead>Hospital</TableHead>
                            <TableHead>Blood Details</TableHead>
                            <TableHead>Urgency</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Alerts</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processedRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No requests found matching criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            processedRequests.map((req) => (
                                <TableRow key={req.id} className={req.needsEscalation ? "bg-destructive/5 hover:bg-destructive/10" : ""}>
                                    <TableCell className="font-medium text-xs font-mono">{req.id}</TableCell>
                                    <TableCell>
                                        <span className="block font-medium">{req.hospitalName}</span>
                                        <span className="text-xs text-muted-foreground">{req.hospitalId}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-bold">{req.bloodGroup}</Badge>
                                            <span className="text-sm">{req.quantity} Units {req.componentType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getUrgencyBadgeVariant(req.urgency) as any} className="capitalize">
                                            {req.urgency}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(req.status) as any} className="capitalize">
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {req.needsEscalation ? (
                                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                                <ShieldAlert className="h-3 w-3" />
                                                Escalate
                                            </Badge>
                                        ) : req.isStuck ? (
                                            <Badge variant={"warning" as any} className="flex items-center gap-1 w-fit">
                                                <AlertTriangle className="h-3 w-3" />
                                                Stuck
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedRequestId(req.id)}>
                                                View <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        disabled={req.status === "collected"}
                                                        onClick={() => {
                                                            setOverrideModalReqId(req.id)
                                                            setOverrideStatus(req.status)
                                                        }}
                                                    >
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Override Status
                                                    </DropdownMenuItem>

                                                    {req.urgency === "critical" && !req.timeline.some(t => t.status === "escalated") && (
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            onClick={() => setEscalateModalReqId(req.id)}
                                                        >
                                                            <Zap className="mr-2 h-4 w-4" />
                                                            Escalate Emergency
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                        onClick={() => setSuspendModalOrgId(req.hospitalId)}
                                                    >
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        Suspend Organization
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Timeline Drawer */}
            <Sheet open={!!selectedRequestId} onOpenChange={(open) => !open && setSelectedRequestId(null)}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader className="pb-4 border-b">
                        <SheetTitle>Request Details</SheetTitle>
                        <SheetDescription>
                            {selectedRequest?.id} • {selectedRequest?.hospitalName}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedRequest && (
                        <div className="py-6 space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Blood Group</p>
                                    <p className="font-bold text-lg text-primary">{selectedRequest.bloodGroup} {selectedRequest.componentType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Quantity</p>
                                    <p className="font-medium text-lg">{selectedRequest.quantity} Units</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Urgency</p>
                                    <Badge variant={getUrgencyBadgeVariant(selectedRequest.urgency) as any} className="mt-1 capitalize">
                                        {selectedRequest.urgency}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase">Current Status</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={getStatusBadgeVariant(selectedRequest.status) as any} className="capitalize">
                                            {selectedRequest.status}
                                        </Badge>
                                        {selectedRequest.overridden && (
                                            <Badge variant="outline" className="border-warning text-warning text-[10px] h-5">
                                                OVERRIDDEN
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedRequest.overridden && selectedRequest.overrideReason && (
                                <div className="bg-warning/10 border border-warning/20 rounded-md p-3 text-sm">
                                    <p className="font-semibold text-warning mb-1 flex items-center gap-1">
                                        <ShieldAlert className="h-4 w-4" />
                                        Admin Override Record
                                    </p>
                                    <p className="text-muted-foreground italic">&ldquo;{selectedRequest.overrideReason}&rdquo;</p>
                                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                                        Timestamp: {formatDateTimeNative(selectedRequest.overriddenAt || now)}
                                    </p>
                                </div>
                            )}

                            {/* Timeline (Part 3) */}
                            <div>
                                <h3 className="font-semibold flex items-center gap-2 mb-4">
                                    <Activity className="h-4 w-4" />
                                    Activity Timeline
                                </h3>
                                <div className="space-y-4 pl-2 border-l-2 ml-2">
                                    {selectedRequest.timeline?.sort((a, b) => a.timestamp - b.timestamp).map((event, index, all) => {
                                        const prevEvent = index > 0 ? all[index - 1] : null;
                                        const durationMs = prevEvent ? event.timestamp - prevEvent.timestamp : 0;
                                        const durationMins = Math.floor(durationMs / 60000);

                                        const isSlowResponse = index === 1 && durationMins > 5;

                                        return (
                                            <div key={event.timestamp} className="relative pl-6">
                                                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background" />

                                                <div className="flex flex-col">
                                                    <span className="font-medium capitalize">{event.status.replace('-', ' ')}</span>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDateTimeNative(event.timestamp)}
                                                    </div>

                                                    {prevEvent && (
                                                        <div className={`text-xs mt-1 font-medium ${isSlowResponse ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                            ↗ Took {durationMins} minutes
                                                            {isSlowResponse && " (SLA Breach)"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {/* Active timer if still sent */}
                                    {selectedRequest.status === "sent" && selectedRequest.timeline?.length > 0 && (
                                        <div className="relative pl-6 pt-2">
                                            <div className="absolute w-3 h-3 bg-muted rounded-full -left-[7px] top-3 ring-4 ring-background animate-pulse" />
                                            <div className="flex flex-col opacity-70">
                                                <span className="font-medium text-sm italic">Waiting for response...</span>
                                                <span className="text-xs">
                                                    Current wait: {Math.floor((now - selectedRequest.timeline[selectedRequest.timeline.length - 1].timestamp) / 60000)} minutes
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Override Status Modal */}
            <Dialog open={!!overrideModalReqId} onOpenChange={(open) => !open && setOverrideModalReqId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Admin Status Override</DialogTitle>
                        <DialogDescription>
                            Force a status change for request <span className="font-mono font-medium text-foreground">{overrideModalReqId}</span>.
                            This bypasses normal state machines and generates an audit log.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>New Status</Label>
                            <Select value={overrideStatus} onValueChange={(v) => setOverrideStatus(v as RequestStatus)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="partially-accepted">Partially Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="collected">Collected</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Override Reason (Required)</Label>
                            <Textarea
                                placeholder="State why this override is necessary..."
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOverrideModalReqId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleOverrideSubmit}>Confirm Override</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Escalate Modal */}
            <Dialog open={!!escalateModalReqId} onOpenChange={(open) => !open && setEscalateModalReqId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Zap className="h-5 w-5" />
                            Escalate Emergency
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to escalate request <span className="font-mono">{escalateModalReqId}</span>?
                            This will trigger critical network-wide alerts.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setEscalateModalReqId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleEscalateConfirm}>Confirm Escalation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Suspend Organization Modal */}
            <Dialog open={!!suspendModalOrgId} onOpenChange={(open) => !open && setSuspendModalOrgId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Ban className="h-5 w-5" />
                            Force Suspend Organization
                        </DialogTitle>
                        <DialogDescription>
                            You are about to suspend organization ID <span className="font-mono">{suspendModalOrgId}</span>.
                            This will immediately revoke their access and log them out if active.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Suspension Reason (Required)</Label>
                            <Textarea
                                placeholder="Provide the reason for suspension for the audit log..."
                                value={suspendReason}
                                onChange={(e) => setSuspendReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSuspendModalOrgId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleSuspendConfirm}>Confirm Suspension</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
