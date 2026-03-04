"use client"

import * as React from "react"
import { useAdminRegistrationStore } from "@/lib/store/admin-registration-store"
import { OrganizationRegistration, RegistrationStatus } from "@/types/registration"
import { getStatusVariant } from "@/lib/utils/registration-status-map"
import {
    CheckCircle2,
    XCircle,
    AlertOctagon,
    FileText,
    ExternalLink,
    MoreVertical,
    Eye
} from "lucide-react"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Native date formatter
const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).format(new Date(timestamp))
}

const formatDateTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(new Date(timestamp))
}

const RegistrationTable = ({
    data,
    status,
    handleOpenView,
    onSuspend
}: {
    data: OrganizationRegistration[],
    status: string,
    handleOpenView: (org: OrganizationRegistration) => void,
    onSuspend: (id: string) => void
}) => (
    <div className="rounded-md border bg-card">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Organization Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No {status} registrations found.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((reg) => (
                        <TableRow key={reg.id}>
                            <TableCell className="font-medium">{reg.name}</TableCell>
                            <TableCell className="capitalize">{reg.type.replace("-", " ")}</TableCell>
                            <TableCell>{formatDate(reg.submittedAt)}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(reg.status) as any}>
                                    {reg.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenView(reg)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {reg.status === "approved" && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive font-medium"
                                                    onClick={() => onSuspend(reg.id)}
                                                >
                                                    <AlertOctagon className="mr-2 h-4 w-4" />
                                                    Suspend Access
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    </div>
)

export default function VerificationPage() {
    const { registrations, approveRegistration, rejectRegistration, suspendOrganization } = useAdminRegistrationStore()
    const [selectedOrg, setSelectedOrg] = React.useState<OrganizationRegistration | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = React.useState(false)
    const [remarks, setRemarks] = React.useState("")
    const [isRejectMode, setIsRejectMode] = React.useState(false)

    const handleOpenView = (org: OrganizationRegistration) => {
        setSelectedOrg(org)
        setIsViewModalOpen(true)
        setIsRejectMode(false)
        setRemarks("")
    }

    const onApprove = (id: string) => {
        approveRegistration(id)
        toast.success("Organization approved successfully")
        setIsViewModalOpen(false)
    }

    const onReject = (id: string) => {
        if (!remarks.trim()) {
            toast.error("Please provide remarks for rejection")
            return
        }
        rejectRegistration(id, remarks)
        toast.error("Organization rejected")
        setIsViewModalOpen(false)
    }

    const onSuspend = (id: string) => {
        suspendOrganization(id)
        toast.warning("Organization suspended")
    }

    const filteredRegistrations = (status: RegistrationStatus) =>
        registrations.filter(r => r.status === status)

    return (
        <div className="space-y-6 p-1 md:p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Organization Verification</h1>
                <p className="text-muted-foreground">Review and manage organizational registration requests.</p>
            </div>

            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="suspended">Suspended</TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                    <RegistrationTable data={filteredRegistrations("pending")} status="pending" handleOpenView={handleOpenView} onSuspend={onSuspend} />
                </TabsContent>
                <TabsContent value="approved">
                    <RegistrationTable data={filteredRegistrations("approved")} status="approved" handleOpenView={handleOpenView} onSuspend={onSuspend} />
                </TabsContent>
                <TabsContent value="rejected">
                    <RegistrationTable data={filteredRegistrations("rejected")} status="rejected" handleOpenView={handleOpenView} onSuspend={onSuspend} />
                </TabsContent>
                <TabsContent value="suspended">
                    <RegistrationTable data={filteredRegistrations("suspended")} status="suspended" handleOpenView={handleOpenView} onSuspend={onSuspend} />
                </TabsContent>
            </Tabs>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-3xl sm:max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Registration Details: {selectedOrg?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Review the documents submitted by this organization.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrg && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Email Address</span>
                                    <span className="font-medium underline decoration-muted/50">{selectedOrg.email}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Submission Date</span>
                                    <span className="font-medium">{formatDateTime(selectedOrg.submittedAt)}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2 border-b pb-1">
                                    Documents
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-2 rounded-lg border p-4 bg-muted/30">
                                        <span className="text-xs font-semibold uppercase text-muted-foreground">Operating License</span>
                                        <div className="aspect-[4/5] w-full bg-muted flex items-center justify-center rounded border border-dashed text-muted-foreground">
                                            <FileText className="h-12 w-12 opacity-20" />
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={selectedOrg.documents.licenseUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-2 h-3 w-3" />
                                                Open License PDF
                                            </a>
                                        </Button>
                                    </div>
                                    {selectedOrg.documents.certificationUrl && (
                                        <div className="flex flex-col gap-2 rounded-lg border p-4 bg-muted/30">
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">Special Certification</span>
                                            <div className="aspect-[4/5] w-full bg-muted flex items-center justify-center rounded border border-dashed text-muted-foreground">
                                                <FileText className="h-12 w-12 opacity-20" />
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={selectedOrg.documents.certificationUrl} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-3 w-3" />
                                                    Open Certificate PDF
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isRejectMode && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="text-sm font-semibold text-destructive">Rejection Remarks (Required)</label>
                                    <Textarea
                                        placeholder="Enter reason for rejection..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="border-destructive/50 focus-visible:ring-destructive"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        {selectedOrg?.status === "pending" && (
                            <>
                                {!isRejectMode ? (
                                    <>
                                        <Button variant="destructive" onClick={() => setIsRejectMode(true)}>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject
                                        </Button>
                                        <Button onClick={() => onApprove(selectedOrg.id)} className="bg-success hover:bg-success/90">
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Approve Organization
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" onClick={() => setIsRejectMode(false)}>Cancel</Button>
                                        <Button variant="destructive" onClick={() => onReject(selectedOrg.id)}>
                                            Confirm Rejection
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                        {selectedOrg?.status !== "pending" && (
                            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
