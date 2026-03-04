"use client"

import * as React from "react"
import { useAuditStore, AuditEvent } from "@/lib/store/audit-store"
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

// ── Constants ────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 20

const ROLE_OPTIONS = ["all", "admin", "hospital", "blood-bank"] as const
const ENTITY_OPTIONS = [
    "all",
    "request",
    "inventory",
    "staff",
    "registration",
    "system",
] as const
const ACTION_OPTIONS = [
    "all",
    "create",
    "update",
    "delete",
    "approve",
    "reject",
    "override",
    "suspend",
] as const

type RoleFilter = (typeof ROLE_OPTIONS)[number]
type EntityFilter = (typeof ENTITY_OPTIONS)[number]
type ActionFilter = (typeof ACTION_OPTIONS)[number]

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
    const d = new Date(ts)
    return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    })
}

function inferEntityType(action: string): string {
    const lower = action.toLowerCase()
    if (lower.includes("request") || lower.includes("escalate"))
        return "request"
    if (lower.includes("inventory")) return "inventory"
    if (lower.includes("staff")) return "staff"
    if (
        lower.includes("registration") ||
        lower.includes("suspend") ||
        lower.includes("organization")
    )
        return "registration"
    return "system"
}

function inferActionType(action: string): string {
    const lower = action.toLowerCase()
    if (lower.includes("approve")) return "approve"
    if (lower.includes("reject")) return "reject"
    if (lower.includes("override")) return "override"
    if (lower.includes("suspend")) return "suspend"
    if (lower.includes("create")) return "create"
    if (lower.includes("update")) return "update"
    if (lower.includes("delete")) return "delete"
    if (lower.includes("escalate")) return "override"
    return "update"
}

function formatAction(action: string): string {
    return action
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
}

function truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen) + "…"
}

// ── CSV Export ───────────────────────────────────────────────────────────────

function exportCsv(events: AuditEvent[]) {
    const headers = [
        "Timestamp",
        "Actor Role",
        "Action",
        "Entity Type",
        "Entity ID",
    ]
    const rows = events.map((e) => [
        formatTimestamp(e.timestamp),
        e.actorRole,
        e.action,
        inferEntityType(e.action),
        e.targetId,
    ])

    const csvContent = [
        headers.join(","),
        ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]
    link.href = url
    link.download = `bloodconnect-audit-${date}.csv`
    link.click()
    URL.revokeObjectURL(url)
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
    const events = useAuditStore((state) => state.events)

    // Filters
    const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all")
    const [entityFilter, setEntityFilter] =
        React.useState<EntityFilter>("all")
    const [actionFilter, setActionFilter] =
        React.useState<ActionFilter>("all")
    const [dateFrom, setDateFrom] = React.useState("")
    const [dateTo, setDateTo] = React.useState("")
    const [search, setSearch] = React.useState("")

    // Pagination
    const [page, setPage] = React.useState(1)

    // Reset to page 1 on filter change
    React.useEffect(() => {
        setPage(1)
    }, [roleFilter, entityFilter, actionFilter, dateFrom, dateTo, search])

    // ── Filtering ────────────────────────────────────────────────────────────

    const filteredEvents = React.useMemo(() => {
        return events.filter((e) => {
            // Role filter
            if (roleFilter !== "all" && e.actorRole !== roleFilter) return false

            // Entity type filter
            if (entityFilter !== "all") {
                const entity = inferEntityType(e.action)
                if (entity !== entityFilter) return false
            }

            // Action type filter
            if (actionFilter !== "all") {
                const action = inferActionType(e.action)
                if (action !== actionFilter) return false
            }

            // Date range
            if (dateFrom) {
                const from = new Date(dateFrom).getTime()
                if (e.timestamp < from) return false
            }
            if (dateTo) {
                const to = new Date(dateTo).getTime() + 86400000 // include full day
                if (e.timestamp > to) return false
            }

            // Search
            if (search) {
                const q = search.toLowerCase()
                const matchesTarget = e.targetId.toLowerCase().includes(q)
                const matchesActor = e.actorRole.toLowerCase().includes(q)
                const matchesAction = e.action.toLowerCase().includes(q)
                if (!matchesTarget && !matchesActor && !matchesAction)
                    return false
            }

            return true
        })
    }, [events, roleFilter, entityFilter, actionFilter, dateFrom, dateTo, search])

    // ── Pagination calc ──────────────────────────────────────────────────────

    const totalCount = filteredEvents.length
    const totalPages = Math.max(1, Math.ceil(totalCount / ROWS_PER_PAGE))
    const safePage = Math.min(page, totalPages)
    const startIdx = (safePage - 1) * ROWS_PER_PAGE
    const paginatedEvents = filteredEvents.slice(
        startIdx,
        startIdx + ROWS_PER_PAGE
    )

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6 p-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                    <p className="text-sm text-muted-foreground">
                        View and export system audit events
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportCsv(filteredEvents)}
                    disabled={filteredEvents.length === 0}
                    className="gap-2 self-start"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label htmlFor="filter-role">Role</Label>
                            <Select
                                value={roleFilter}
                                onValueChange={(v) =>
                                    setRoleFilter(v as RoleFilter)
                                }
                            >
                                <SelectTrigger id="filter-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLE_OPTIONS.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r === "all"
                                                ? "All Roles"
                                                : r.charAt(0).toUpperCase() +
                                                r.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Entity Type */}
                        <div className="space-y-1.5">
                            <Label htmlFor="filter-entity">Entity Type</Label>
                            <Select
                                value={entityFilter}
                                onValueChange={(v) =>
                                    setEntityFilter(v as EntityFilter)
                                }
                            >
                                <SelectTrigger id="filter-entity">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ENTITY_OPTIONS.map((e) => (
                                        <SelectItem key={e} value={e}>
                                            {e === "all"
                                                ? "All Entities"
                                                : e.charAt(0).toUpperCase() +
                                                e.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Type */}
                        <div className="space-y-1.5">
                            <Label htmlFor="filter-action">Action</Label>
                            <Select
                                value={actionFilter}
                                onValueChange={(v) =>
                                    setActionFilter(v as ActionFilter)
                                }
                            >
                                <SelectTrigger id="filter-action">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTION_OPTIONS.map((a) => (
                                        <SelectItem key={a} value={a}>
                                            {a === "all"
                                                ? "All Actions"
                                                : a.charAt(0).toUpperCase() +
                                                a.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date From */}
                        <div className="space-y-1.5">
                            <Label htmlFor="filter-from">From</Label>
                            <Input
                                id="filter-from"
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        {/* Date To */}
                        <div className="space-y-1.5">
                            <Label htmlFor="filter-to">To</Label>
                            <Input
                                id="filter-to"
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        {/* Search */}
                        <div className="space-y-1.5">
                            <Label htmlFor="filter-search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="filter-search"
                                    placeholder="Entity ID or actor…"
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead scope="col">Timestamp</TableHead>
                                    <TableHead scope="col">Actor</TableHead>
                                    <TableHead scope="col">Role</TableHead>
                                    <TableHead scope="col">Action</TableHead>
                                    <TableHead scope="col">Entity</TableHead>
                                    <TableHead scope="col">Entity ID</TableHead>
                                    <TableHead scope="col">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedEvents.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            {events.length === 0
                                                ? "No audit events recorded yet."
                                                : "No events match the current filters."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedEvents.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell className="whitespace-nowrap text-xs font-mono">
                                                {formatTimestamp(
                                                    event.timestamp
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                System
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize">
                                                    {event.actorRole}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium">
                                                {formatAction(event.action)}
                                            </TableCell>
                                            <TableCell className="text-sm capitalize">
                                                {inferEntityType(event.action)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {truncate(event.targetId, 20)}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                                                {truncate(event.action, 40)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div
                        className="flex items-center justify-between border-t px-4 py-3"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <p className="text-sm text-muted-foreground">
                            {totalCount === 0
                                ? "0 results"
                                : `Showing ${startIdx + 1}–${Math.min(startIdx + ROWS_PER_PAGE, totalCount)} of ${totalCount}`}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={safePage <= 1}
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">
                                    Previous
                                </span>
                            </Button>
                            <span className="text-sm font-medium tabular-nums">
                                {safePage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={safePage >= totalPages}
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(totalPages, p + 1)
                                    )
                                }
                                aria-label="Next page"
                            >
                                <span className="hidden sm:inline mr-1">
                                    Next
                                </span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
