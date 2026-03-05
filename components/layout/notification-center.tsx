"use client"

import * as React from "react"
import { Bell, BellOff, CheckCheck } from "lucide-react"
import { useNotificationStore } from "@/lib/store/notification-store"
import { usePushPermission } from "@/hooks/use-push-permission"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRelativeTime(timestamp: number): string {
    const diff = Math.floor((Date.now() - timestamp) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

function priorityColor(priority: string): string {
    switch (priority) {
        case "critical":
            return "text-destructive"
        case "moderate":
            return "text-orange-500"
        default:
            return "text-foreground"
    }
}

function priorityDot(priority: string): string {
    switch (priority) {
        case "critical":
            return "bg-destructive"
        case "moderate":
            return "bg-orange-500"
        default:
            return "bg-muted-foreground/40"
    }
}

// ── Component ────────────────────────────────────────────────────────────────

export function NotificationCenter() {
    const {
        notifications,
        getUnreadCount,
        markAsRead,
        markAllAsRead,
        acknowledgeNotification,
    } = useNotificationStore()
    const { permission, requestPermission, isSupported } = usePushPermission()

    const unreadCount = getUnreadCount()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-[10px]"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 sm:w-96"
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                {/* Header */}
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="font-semibold">Notifications</span>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <span className="text-xs font-normal text-muted-foreground">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* Push permission prompt */}
                {isSupported && permission === "default" && (
                    <>
                        <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <BellOff className="h-3.5 w-3.5" />
                                <span>Desktop notifications are off</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    requestPermission()
                                }}
                            >
                                Enable
                            </Button>
                        </div>
                        <DropdownMenuSeparator />
                    </>
                )}

                {/* Notification list */}
                <ScrollArea className="h-[320px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-30" />
                            <span>No notifications yet</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0.5 p-1" role="list" aria-label="Notification list">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    role="listitem"
                                    className={`flex items-start gap-3 p-3 cursor-pointer outline-none focus:bg-accent rounded-md ${notification.status === "unread"
                                        ? "bg-muted/50"
                                        : ""
                                        }`}
                                    onClick={() => {
                                        if (notification.status === "unread") {
                                            markAsRead(notification.id)
                                        }
                                        if (
                                            notification.priority ===
                                            "critical" &&
                                            notification.status !==
                                            "acknowledged"
                                        ) {
                                            acknowledgeNotification(
                                                notification.id
                                            )
                                        }
                                    }}
                                >
                                    {/* Priority dot */}
                                    <span
                                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDot(notification.priority)}`}
                                        aria-hidden="true"
                                    />

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`font-semibold text-sm truncate ${priorityColor(notification.priority)}`}
                                            >
                                                {notification.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                                {getRelativeTime(
                                                    notification.createdAt
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                            {notification.message}
                                        </p>
                                        {notification.priority === "critical" &&
                                            notification.status !==
                                            "acknowledged" && (
                                                <Badge
                                                    variant="destructive"
                                                    className="mt-1.5 text-[10px] animate-pulse"
                                                >
                                                    Action Required
                                                </Badge>
                                            )}
                                    </div>

                                    {/* Read indicator */}
                                    {notification.status === "unread" && (
                                        <span
                                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                                            aria-label="Unread"
                                        />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer actions */}
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-1.5 flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 h-8 text-xs justify-center gap-1.5"
                                disabled={unreadCount === 0}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    markAllAsRead()
                                }}
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Mark all as read
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
