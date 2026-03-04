import { create } from 'zustand'
import { AppNotification } from '@/types/notification'

const MAX_NOTIFICATIONS = 100

interface NotificationState {
    notifications: AppNotification[]
    activeSound: boolean
    addNotification: (notification: Omit<AppNotification, "createdAt" | "status">) => void
    removeNotification: (id: string) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    acknowledgeNotification: (id: string) => void
    clearAll: () => void
    getUnreadCount: () => number
}

const checkCriticalSound = (notifications: AppNotification[]) => {
    return notifications.some(n => n.priority === 'critical' && n.status !== 'acknowledged')
}

function tryBrowserNotification(title: string, body: string) {
    if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
    ) {
        new Notification(title, { body })
    }
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
    notifications: [],
    activeSound: false,

    addNotification: (newNotif) => {
        const { notifications, removeNotification } = get()

        // Prevent duplicate IDs
        if (notifications.some(n => n.id === newNotif.id)) {
            return
        }

        const isCritical = newNotif.priority === 'critical'
        const isModerate = newNotif.priority === 'moderate'
        const duration = isCritical ? undefined : (newNotif.duration ?? 5000)
        const autoClose = isCritical ? false : (newNotif.autoClose ?? true)

        const notification: AppNotification = {
            ...newNotif,
            createdAt: Date.now(),
            status: 'unread',
            autoClose,
            duration
        }

        // Browser push for critical and moderate
        if (isCritical || isModerate) {
            tryBrowserNotification(notification.title, notification.message)
        }

        set((state) => {
            // Prepend new notification and cap at MAX_NOTIFICATIONS
            const updatedNotifications = [notification, ...state.notifications]
            if (updatedNotifications.length > MAX_NOTIFICATIONS) {
                updatedNotifications.length = MAX_NOTIFICATIONS
            }
            return {
                notifications: updatedNotifications,
                activeSound: isCritical ? true : state.activeSound
            }
        })

        if (autoClose && duration) {
            setTimeout(() => {
                removeNotification(notification.id)
            }, duration)
        }
    },

    removeNotification: (id) => {
        set((state) => {
            const updatedNotifications = state.notifications.filter(n => n.id !== id)
            return {
                notifications: updatedNotifications,
                activeSound: checkCriticalSound(updatedNotifications)
            }
        })
    },

    markAsRead: (id) => {
        set((state) => {
            const updatedNotifications = state.notifications.map(n =>
                n.id === id ? { ...n, status: 'read' as const } : n
            )
            return { notifications: updatedNotifications }
        })
    },

    markAllAsRead: () => {
        set((state) => ({
            notifications: state.notifications.map(n =>
                n.status === 'unread' ? { ...n, status: 'read' as const } : n
            )
        }))
    },

    acknowledgeNotification: (id) => {
        set((state) => {
            const updatedNotifications = state.notifications.map(n =>
                (n.id === id && n.priority === 'critical')
                    ? { ...n, status: 'acknowledged' as const }
                    : n
            )
            return {
                notifications: updatedNotifications,
                activeSound: checkCriticalSound(updatedNotifications)
            }
        })
    },

    clearAll: () => {
        set({ notifications: [], activeSound: false })
    },

    getUnreadCount: () => {
        return get().notifications.filter(n => n.status === 'unread').length
    }
}))
