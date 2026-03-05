"use client"

import * as React from "react"
import { useSystemConfigStore } from "@/lib/store/system-config-store"
import { useShallow } from "zustand/react/shallow"
import { SystemConfig } from "@/types/system-config"
import { toast } from "sonner"
import {
    Save,
    Bell,
    Clock,
    Database,
    Megaphone,
    XCircle
} from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function AdminConfigurationPage() {
    const { config, updateConfig, broadcastAnnouncement, clearAnnouncement } = useSystemConfigStore(useShallow(state => ({
        config: state.config,
        updateConfig: state.updateConfig,
        broadcastAnnouncement: state.broadcastAnnouncement,
        clearAnnouncement: state.clearAnnouncement
    })))

    // Local form state for SLA and Thresholds
    const [formData, setFormData] = React.useState<Omit<SystemConfig, "announcementMessage" | "announcementPriority">>({
        slaResponseMinutes: config.slaResponseMinutes,
        emergencyEscalationMinutes: config.emergencyEscalationMinutes,
        stuckRequestThresholdMinutes: config.stuckRequestThresholdMinutes,
        lowStockThreshold: config.lowStockThreshold,
        nearExpiryHours: config.nearExpiryHours
    })

    // Local state for Announcement Builder
    const [announceMsg, setAnnounceMsg] = React.useState("")
    const [announcePriority, setAnnouncePriority] = React.useState<"normal" | "moderate" | "critical">("normal")

    // Update form if external config changes (e.g. initial mount)
    React.useEffect(() => {
        setFormData({
            slaResponseMinutes: config.slaResponseMinutes,
            emergencyEscalationMinutes: config.emergencyEscalationMinutes,
            stuckRequestThresholdMinutes: config.stuckRequestThresholdMinutes,
            lowStockThreshold: config.lowStockThreshold,
            nearExpiryHours: config.nearExpiryHours
        })
    }, [config])

    const handleNumberChange = (key: keyof typeof formData, value: string) => {
        const num = parseInt(value, 10)
        if (!isNaN(num)) {
            setFormData(prev => ({ ...prev, [key]: num }))
        } else if (value === "") {
            setFormData(prev => ({ ...prev, [key]: 0 })) // Allow temporary empty for typing
        }
    }

    const handleSaveSettings = () => {
        updateConfig(formData)
        toast.success("System configurations updated successfully.")
    }

    const handleBroadcast = () => {
        if (!announceMsg.trim()) {
            toast.error("Please enter an announcement message.")
            return
        }
        broadcastAnnouncement(announceMsg, announcePriority)
        setAnnounceMsg("")
        toast.success("System announcement broadcasted.")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage global system rules, thresholds, and broadcast announcements.
                    </p>
                </div>
                <Button onClick={handleSaveSettings} className="gap-2">
                    <Save className="h-4 w-4" /> Save Settings
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* SLA Settings Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            SLA Response Settings
                        </CardTitle>
                        <CardDescription>Configure the critical turnaround times for blood requests.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Critical Response Time (Minutes)</Label>
                            <Input
                                type="number"
                                value={formData.slaResponseMinutes}
                                onChange={(e) => handleNumberChange("slaResponseMinutes", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Time before high-priority alerts trigger for unacknowledged critical requests.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Emergency Escalation Wait (Minutes)</Label>
                            <Input
                                type="number"
                                value={formData.emergencyEscalationMinutes}
                                onChange={(e) => handleNumberChange("emergencyEscalationMinutes", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Time before auto-escalating critical emergencies across the network.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Stuck Request Threshold (Minutes)</Label>
                            <Input
                                type="number"
                                value={formData.stuckRequestThresholdMinutes}
                                onChange={(e) => handleNumberChange("stuckRequestThresholdMinutes", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Time before a normal request is flagged as &ldquo;Stuck&rdquo; awaiting blood bank action.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Thresholds Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            Inventory Thresholds
                        </CardTitle>
                        <CardDescription>Manage limits for low stock definitions and expiry warnings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Low Stock Threshold (Units)</Label>
                            <Input
                                type="number"
                                value={formData.lowStockThreshold}
                                onChange={(e) => handleNumberChange("lowStockThreshold", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Any blood group dropping below this value will trigger low stock flags.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Near-Expiry Warning (Hours)</Label>
                            <Input
                                type="number"
                                value={formData.nearExpiryHours}
                                onChange={(e) => handleNumberChange("nearExpiryHours", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Inventory items approaching expiration within this window will be highlighted.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Broadcast Announcement Card */}
                <Card className="md:col-span-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            System Announcements
                        </CardTitle>
                        <CardDescription>Broadcast a banner message to all active operators.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Active Announcement Status */}
                        {config.announcementMessage ? (
                            <div className={`p-4 rounded-md border flex items-start justify-between ${config.announcementPriority === "critical" ? "bg-destructive/10 border-destructive text-destructive" :
                                config.announcementPriority === "moderate" ? "bg-warning/10 border-warning text-warning" :
                                    "bg-primary/10 border-primary text-primary"
                                }`}>
                                <div>
                                    <div className="flex items-center gap-2 font-bold mb-1">
                                        Active Broadcast
                                        <Badge variant="outline" className="uppercase text-[10px]">
                                            {config.announcementPriority}
                                        </Badge>
                                    </div>
                                    <p className="font-medium">&ldquo;{config.announcementMessage}&rdquo;</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => {
                                    clearAnnouncement()
                                    toast.success("Announcement cleared.")
                                }}>
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="p-4 rounded-md border border-dashed text-center text-muted-foreground bg-muted/20">
                                No active announcements running.
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-4 items-end">
                            <div className="space-y-2 sm:col-span-2">
                                <Label>New Message</Label>
                                <Textarea
                                    placeholder="Enter system alert message..."
                                    value={announceMsg}
                                    onChange={(e) => setAnnounceMsg(e.target.value)}
                                    className="resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority Level</Label>
                                <Select value={announcePriority} onValueChange={(v) => setAnnouncePriority(v as "normal" | "moderate" | "critical")}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal (Info)</SelectItem>
                                        <SelectItem value="moderate">Moderate (Warning)</SelectItem>
                                        <SelectItem value="critical">Critical (Alert)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full gap-2" variant="secondary" onClick={handleBroadcast}>
                                <Bell className="h-4 w-4" /> Broadcast
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
