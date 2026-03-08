"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, CheckCircle, Clock, Siren } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotificationStore } from "@/lib/store/notification-store"
import { useSystemConfigStore } from "@/lib/store/system-config-store"
import { useShallow } from "zustand/react/shallow"
import type { AppNotification } from "@/types/notification"

// ─── Pure helpers (no closure risk) ──────────────────────────────────────────
function formatTime(seconds: number): string {
    const clamped = Math.max(0, Math.floor(seconds))
    const mins = Math.floor(clamped / 60)
    const secs = clamped % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
}

function calcRemaining(createdAt: number, slaSeconds: number, deadline?: string): number {
    if (deadline && !isNaN(Date.parse(deadline))) {
        return (new Date(deadline).getTime() - Date.now()) / 1000
    }
    return slaSeconds - (Date.now() - createdAt) / 1000
}

// ─── Root gate ────────────────────────────────────────────────────────────────
/**
 * Subscribes to the notification store with a shallow selector so it only
 * re-renders when the filtered critical list reference changes.
 */
export function EmergencyAlert() {
    const criticalNotifications = useNotificationStore(
        useShallow(
            (state): AppNotification[] =>
                state.notifications.filter(
                    (n) => n.priority === "critical" && n.status !== "acknowledged"
                )
        )
    )

    const slaResponseMinutes = useSystemConfigStore(state => state.config.slaResponseMinutes)

    // Memoize sort so we don't re-sort on unrelated store updates.
    const sorted = useMemo(
        () => [...criticalNotifications].sort((a, b) => b.createdAt - a.createdAt),
        [criticalNotifications]
    )

    const active = sorted[0] ?? null

    return (
        <AnimatePresence>
            {active !== null && (
                // key ensures a fresh AlertOverlay (and fresh timer) per notification.
                <AlertOverlay
                    key={active.id}
                    notification={active}
                    siblingCount={sorted.length - 1}
                    slaSeconds={slaResponseMinutes * 60}
                />
            )}
        </AnimatePresence>
    )
}

// ─── Overlay ──────────────────────────────────────────────────────────────────
interface AlertOverlayProps {
    notification: AppNotification
    /** Number of other active critical notifications beside this one. */
    siblingCount: number
    slaSeconds: number
}

function AlertOverlay({ notification, siblingCount, slaSeconds }: AlertOverlayProps) {
    // Shallow-select only the actions we need so this component doesn't
    // re-render when unrelated store slices change.
    const { acknowledgeNotification, removeRealtimeNotification, markAsRead } =
        useNotificationStore(
            useShallow((state) => ({
                acknowledgeNotification: state.acknowledgeNotification,
                removeRealtimeNotification: state.removeRealtimeNotification,
                markAsRead: state.markAsRead,
            }))
        )

    // A single numeric reducer is the lightest way to force a re-render.
    const [, forceUpdate] = useReducer((c: number) => c + 1, 0)

    // Track whether we have already fired the expiry side-effect.
    const hasExpiredRef = useRef(false)

    // Tick every second so calcRemaining() stays accurate.
    useEffect(() => {
        const id = setInterval(() => forceUpdate(), 1000)
        return () => clearInterval(id)
    }, []) // intentionally empty — we only want one stable interval per mount

    // Extract deadline from metadata if available
    const deadline = (notification.metadata && typeof notification.metadata === 'object' && 'response_deadline' in notification.metadata)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (notification.metadata as any).response_deadline
        : undefined;

    const remaining = calcRemaining(notification.createdAt, slaSeconds, deadline)

    // Auto-mark as read once SLA expires (fires at most once per notification).
    useEffect(() => {
        if (remaining <= 0 && !hasExpiredRef.current) {
            hasExpiredRef.current = true
            markAsRead(notification.id)
        }
    }, [remaining, notification.id, markAsRead])

    // Handlers — stable references so child buttons don't get new props each tick.
    const handleAcknowledge = useCallback(() => {
        acknowledgeNotification(notification.id)
    }, [acknowledgeNotification, notification.id])

    const handleAcceptAndDispatch = useCallback(() => {
        acknowledgeNotification(notification.id)
        removeRealtimeNotification(notification.id)
    }, [acknowledgeNotification, removeRealtimeNotification, notification.id])

    // Escape key → acknowledge (only dismisses the current notification).
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleAcknowledge()
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [handleAcknowledge])

    // Focus trap — keep keyboard focus inside the alert overlay.
    const dialogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = dialogRef.current
        if (!el) return

        // Auto-focus the dialog on mount
        el.focus()

        const handleTabTrap = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return
            const focusable = el.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            if (focusable.length === 0) return
            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }

        el.addEventListener("keydown", handleTabTrap)
        return () => el.removeEventListener("keydown", handleTabTrap)
    }, [])

    return (
        <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="alertdialog"
            aria-modal="true"
            aria-live="assertive"
            aria-labelledby="emergency-title"
            aria-describedby="emergency-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/90 backdrop-blur-sm p-4"
        >
            {/* Pulsing background — purely decorative */}
            <motion.div
                aria-hidden="true"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-red-600/20"
            />

            <div className="relative z-10 max-w-2xl w-full p-8 bg-background border-4 border-destructive rounded-lg shadow-2xl text-center space-y-8">
                {/* Siren icon with glow pulse */}
                <div className="flex justify-center">
                    <div className="relative">
                        <motion.div
                            aria-hidden="true"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 bg-red-500 rounded-full opacity-30 blur-xl"
                        />
                        <Siren
                            className="h-24 w-24 text-destructive relative z-10"
                            aria-hidden="true"
                        />
                    </div>
                </div>

                {/* Title + message */}
                <div className="space-y-4">
                    <h2
                        id="emergency-title"
                        className="text-2xl sm:text-4xl md:text-5xl font-black text-destructive tracking-tight uppercase"
                    >
                        {notification.title}
                    </h2>
                    <p
                        id="emergency-description"
                        className="text-lg sm:text-xl md:text-2xl font-bold text-foreground"
                    >
                        {notification.message}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-lg">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        <span>Immediate Action Required: Dispatch Protocol Alpha-1</span>
                    </div>
                    {siblingCount > 0 && (
                        <p className="text-sm text-red-400 font-semibold">
                            +{siblingCount} additional critical{" "}
                            {siblingCount === 1 ? "alert" : "alerts"} pending
                        </p>
                    )}
                </div>

                {/* SLA Countdown */}
                <div
                    className="flex flex-col items-center justify-center space-y-2 p-6 bg-muted/50 rounded-lg border border-red-200 dark:border-red-900"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Response SLA Remaining
                    </span>
                    <div className="flex items-center gap-3 text-3xl sm:text-4xl font-mono font-bold text-destructive">
                        <Clock className="h-8 w-8" aria-hidden="true" />
                        <span
                            aria-label={`${Math.max(0, Math.floor(remaining))} seconds remaining`}
                        >
                            {remaining > 0 ? formatTime(remaining) : "0:00"}
                        </span>
                    </div>
                    {remaining <= 0 && (
                        <span className="text-xs text-red-500 font-semibold uppercase tracking-wider mt-1">
                            SLA Expired
                        </span>
                    )}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleAcknowledge}
                        className="h-16 text-lg border-2"
                        aria-label="Acknowledge this emergency alert"
                    >
                        Acknowledge Only
                    </Button>
                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={handleAcceptAndDispatch}
                        className="h-16 text-lg font-bold animate-pulse"
                        aria-label="Accept and dispatch emergency response"
                    >
                        <CheckCircle className="mr-2 h-6 w-6" aria-hidden="true" />
                        Accept &amp; Dispatch
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
