"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { useNotificationStore } from "@/lib/store/notification-store"

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

function getRelativeTime(timestamp: number) {
    const diff = Math.floor((Date.now() - timestamp) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export function NotificationBell() {
    const { notifications, getUnreadCount, markAsRead, acknowledgeNotification } = useNotificationStore()
    const unreadCount = getUnreadCount()

    // Sort by newest first
    const sortedNotifications = [...notifications].sort((a, b) => b.createdAt - a.createdAt)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-xs font-normal text-muted-foreground">
                            {unreadCount} unread
                        </span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px] overflow-y-auto">
                    {sortedNotifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 p-1">
                            {sortedNotifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer outline-none focus:bg-accent ${notification.status === 'unread' ? 'bg-muted/50' : ''
                                        }`}
                                    onClick={() => {
                                        if (notification.status === 'unread') {
                                            markAsRead(notification.id)
                                        }
                                        if (notification.priority === 'critical' && notification.status !== 'acknowledged') {
                                            acknowledgeNotification(notification.id)
                                        }
                                    }}
                                >
                                    <div className="flex w-full items-center justify-between gap-2">
                                        <span className={`font-semibold text-sm ${notification.priority === 'critical' ? 'text-destructive' :
                                                notification.priority === 'moderate' ? 'text-orange-500' :
                                                    'text-foreground'
                                            }`}>
                                            {notification.title}
                                        </span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {getRelativeTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {notification.message}
                                    </p>
                                    {notification.priority === 'critical' && notification.status !== 'acknowledged' && (
                                        <Badge variant="destructive" className="mt-2 text-[10px] animate-pulse">
                                            Action Required
                                        </Badge>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
