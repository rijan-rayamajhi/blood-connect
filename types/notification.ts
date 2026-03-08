export type NotificationPriority = "critical" | "moderate" | "normal"

export type NotificationStatus =
    | "unread"
    | "read"
    | "acknowledged"

export interface AppNotification {
    id: string
    title: string
    message: string
    priority: NotificationPriority
    createdAt: number
    status: NotificationStatus
    autoClose?: boolean
    duration?: number
    metadata?: Record<string, unknown>
}
