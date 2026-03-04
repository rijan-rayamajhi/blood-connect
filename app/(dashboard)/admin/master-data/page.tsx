"use client"

import * as React from "react"
import { Plus, Trash2, Save } from "lucide-react"
import { toast } from "sonner"
import {
    useMasterDataStore,
    UrgencyLevel,
    NotificationRule,
} from "@/lib/store/master-data-store"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

// ── Blood Groups Section ─────────────────────────────────────────────────────

function BloodGroupsSection() {
    const { bloodGroups, addBloodGroup, removeBloodGroup } = useMasterDataStore()
    const [newGroup, setNewGroup] = React.useState("")

    function handleAdd() {
        const trimmed = newGroup.trim().toUpperCase()
        if (!trimmed) return
        const success = addBloodGroup(trimmed)
        if (success) {
            setNewGroup("")
            toast.success(`Blood group "${trimmed}" added.`)
        } else {
            toast.error(`Blood group "${trimmed}" already exists.`)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Blood Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="new-blood-group" className="sr-only">
                            New blood group
                        </Label>
                        <Input
                            id="new-blood-group"
                            placeholder="e.g. A+"
                            value={newGroup}
                            onChange={(e) => setNewGroup(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                    </div>
                    <Button size="sm" onClick={handleAdd} aria-label="Add blood group">
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead scope="col">Blood Group</TableHead>
                                <TableHead scope="col" className="w-20 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bloodGroups.map((bg) => (
                                <TableRow key={bg}>
                                    <TableCell className="font-medium">{bg}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                removeBloodGroup(bg)
                                                toast.success(`Blood group "${bg}" removed.`)
                                            }}
                                            aria-label={`Remove blood group ${bg}`}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {bloodGroups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                                        No blood groups defined.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

// ── Component Types Section ──────────────────────────────────────────────────

function ComponentTypesSection() {
    const { componentTypes, addComponentType, removeComponentType } = useMasterDataStore()
    const [newType, setNewType] = React.useState("")

    function handleAdd() {
        const trimmed = newType.trim()
        if (!trimmed) return
        const success = addComponentType(trimmed)
        if (success) {
            setNewType("")
            toast.success(`Component type "${trimmed}" added.`)
        } else {
            toast.error(`Component type "${trimmed}" already exists.`)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Component Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="new-component-type" className="sr-only">
                            New component type
                        </Label>
                        <Input
                            id="new-component-type"
                            placeholder="e.g. Platelets"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                    </div>
                    <Button size="sm" onClick={handleAdd} aria-label="Add component type">
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead scope="col">Component Type</TableHead>
                                <TableHead scope="col" className="w-20 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {componentTypes.map((ct) => (
                                <TableRow key={ct}>
                                    <TableCell className="font-medium">{ct}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                removeComponentType(ct)
                                                toast.success(`Component type "${ct}" removed.`)
                                            }}
                                            aria-label={`Remove component type ${ct}`}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {componentTypes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                                        No component types defined.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

// ── Urgency Levels Section ───────────────────────────────────────────────────

function UrgencyLevelsSection() {
    const { urgencyLevels, addUrgencyLevel, updateUrgencyLevel, removeUrgencyLevel } =
        useMasterDataStore()

    const [newLabel, setNewLabel] = React.useState("")
    const [newSla, setNewSla] = React.useState("")
    const [newEscalation, setNewEscalation] = React.useState("")

    // Inline editing state
    const [editIndex, setEditIndex] = React.useState<number | null>(null)
    const [editValues, setEditValues] = React.useState<UrgencyLevel | null>(null)

    function handleAdd() {
        const label = newLabel.trim()
        const sla = Number(newSla)
        const esc = Number(newEscalation)

        if (!label) {
            toast.error("Label is required.")
            return
        }
        if (sla <= 0 || isNaN(sla)) {
            toast.error("SLA must be greater than 0.")
            return
        }
        if (esc <= 0 || isNaN(esc)) {
            toast.error("Escalation time must be greater than 0.")
            return
        }

        addUrgencyLevel({ label, slaMinutes: sla, escalationMinutes: esc })
        setNewLabel("")
        setNewSla("")
        setNewEscalation("")
        toast.success(`Urgency level "${label}" added.`)
    }

    function startEdit(index: number) {
        setEditIndex(index)
        setEditValues({ ...urgencyLevels[index] })
    }

    function saveEdit() {
        if (editIndex === null || !editValues) return
        if (editValues.slaMinutes <= 0 || editValues.escalationMinutes <= 0) {
            toast.error("SLA and escalation must be > 0.")
            return
        }
        updateUrgencyLevel(editIndex, editValues)
        setEditIndex(null)
        setEditValues(null)
        toast.success("Urgency level updated.")
    }

    function cancelEdit() {
        setEditIndex(null)
        setEditValues(null)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Urgency Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                    <div>
                        <Label htmlFor="urg-label">Label</Label>
                        <Input
                            id="urg-label"
                            placeholder="e.g. Critical"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="urg-sla">SLA (min)</Label>
                        <Input
                            id="urg-sla"
                            type="number"
                            min={1}
                            placeholder="30"
                            value={newSla}
                            onChange={(e) => setNewSla(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="urg-esc">Escalation (min)</Label>
                        <Input
                            id="urg-esc"
                            type="number"
                            min={1}
                            placeholder="15"
                            value={newEscalation}
                            onChange={(e) => setNewEscalation(e.target.value)}
                        />
                    </div>
                    <Button size="sm" onClick={handleAdd} aria-label="Add urgency level">
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead scope="col">Label</TableHead>
                                <TableHead scope="col">SLA (min)</TableHead>
                                <TableHead scope="col">Escalation (min)</TableHead>
                                <TableHead scope="col" className="w-28 text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {urgencyLevels.map((level, index) => (
                                <TableRow key={index}>
                                    {editIndex === index && editValues ? (
                                        <>
                                            <TableCell>
                                                <Input
                                                    value={editValues.label}
                                                    onChange={(e) =>
                                                        setEditValues({ ...editValues, label: e.target.value })
                                                    }
                                                    aria-label="Edit label"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={editValues.slaMinutes}
                                                    onChange={(e) =>
                                                        setEditValues({
                                                            ...editValues,
                                                            slaMinutes: Number(e.target.value),
                                                        })
                                                    }
                                                    aria-label="Edit SLA"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={editValues.escalationMinutes}
                                                    onChange={(e) =>
                                                        setEditValues({
                                                            ...editValues,
                                                            escalationMinutes: Number(e.target.value),
                                                        })
                                                    }
                                                    aria-label="Edit escalation"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={saveEdit}
                                                    aria-label="Save changes"
                                                >
                                                    <Save className="h-4 w-4 text-green-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={cancelEdit}
                                                    aria-label="Cancel editing"
                                                >
                                                    ✕
                                                </Button>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="font-medium">
                                                {level.label}
                                            </TableCell>
                                            <TableCell>{level.slaMinutes}</TableCell>
                                            <TableCell>{level.escalationMinutes}</TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => startEdit(index)}
                                                    aria-label={`Edit ${level.label}`}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        removeUrgencyLevel(index)
                                                        toast.success(`"${level.label}" removed.`)
                                                    }}
                                                    aria-label={`Remove ${level.label}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                            {urgencyLevels.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                        No urgency levels defined.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

// ── Notification Rules Section ───────────────────────────────────────────────

function NotificationRulesSection() {
    const { notificationRules, updateNotificationRule } = useMasterDataStore()

    function handleUpdate(index: number, changes: Partial<NotificationRule>) {
        const current = notificationRules[index]
        updateNotificationRule(index, { ...current, ...changes })
        toast.success(`"${current.priority}" notification rule updated.`)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Notification Rules</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead scope="col">Priority</TableHead>
                                <TableHead scope="col">Sound</TableHead>
                                <TableHead scope="col">Auto-Dismiss (sec)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notificationRules.map((rule, index) => (
                                <TableRow key={rule.priority}>
                                    <TableCell className="font-medium capitalize">
                                        {rule.priority}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={rule.soundEnabled}
                                            onCheckedChange={(checked) =>
                                                handleUpdate(index, { soundEnabled: checked })
                                            }
                                            aria-label={`Toggle sound for ${rule.priority}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {rule.priority === "critical" ? (
                                            <span className="text-sm text-muted-foreground">
                                                Never (requires acknowledgment)
                                            </span>
                                        ) : (
                                            <Input
                                                type="number"
                                                min={1}
                                                className="w-24"
                                                value={rule.autoDismissSeconds ?? ""}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    handleUpdate(index, {
                                                        autoDismissSeconds:
                                                            val === "" ? null : Number(val),
                                                    })
                                                }}
                                                aria-label={`Auto-dismiss seconds for ${rule.priority}`}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {notificationRules.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                        No notification rules defined.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MasterDataPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Master Data Management</h1>
                <p className="text-sm text-muted-foreground">
                    Configure blood groups, component types, urgency rules, and notification presets.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <BloodGroupsSection />
                <ComponentTypesSection />
            </div>

            <UrgencyLevelsSection />
            <NotificationRulesSection />
        </div>
    )
}
