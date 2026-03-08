import { create } from 'zustand'
import { AppNotification } from '@/types/notification'

const MAX_NOTIFICATIONS = 100

interface NotificationState {
    notifications: AppNotification[]
    activeSound: boolean
    isInitialized: boolean
    fetchNotifications: () => Promise<void>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addRealtimeNotification: (row: Record<string, any>) => void
    updateRealtimeNotification: (id: string, updates: Partial<AppNotification>) => void
    removeRealtimeNotification: (id: string) => void
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    acknowledgeNotification: (id: string) => Promise<void>
    clearAll: () => Promise<void>
    getUnreadCount: () => number

    // Legacy support for mock stores
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addNotification: (notification: any) => void
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
    isInitialized: false,

    fetchNotifications: async () => {
        try {
            const res = await fetch('/api/notifications')
            if (!res.ok) return
            const data = await res.json()
            if (data.success) {
                set({
                    notifications: data.data,
                    activeSound: checkCriticalSound(data.data),
                    isInitialized: true
                })
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    },

    addRealtimeNotification: (row) => {
        const { notifications } = get()

        if (notifications.some(n => n.id === row.id)) {
            return
        }

        const notification: AppNotification = {
            id: row.id,
            title: row.title,
            message: row.message,
            priority: row.priority,
            createdAt: new Date(row.created_at).getTime(),
            status: row.status,
            metadata: row.metadata
        }

        const isCritical = notification.priority === 'critical'
        const isModerate = notification.priority === 'moderate'

        if (isCritical || isModerate) {
            tryBrowserNotification(notification.title, notification.message)
        }

        set((state) => {
            const updatedNotifications = [notification, ...state.notifications]
            if (updatedNotifications.length > MAX_NOTIFICATIONS) {
                updatedNotifications.length = MAX_NOTIFICATIONS
            }
            return {
                notifications: updatedNotifications,
                activeSound: isCritical ? true : checkCriticalSound(updatedNotifications)
            }
        })
    },

    updateRealtimeNotification: (id, updates) => {
        set((state) => {
            const updatedNotifications = state.notifications.map(n =>
                n.id === id ? { ...n, ...updates } : n
            )
            return {
                notifications: updatedNotifications,
                activeSound: checkCriticalSound(updatedNotifications)
            }
        })
    },

    removeRealtimeNotification: (id) => {
        set((state) => {
            const updatedNotifications = state.notifications.filter(n => n.id !== id)
            return {
                notifications: updatedNotifications,
                activeSound: checkCriticalSound(updatedNotifications)
            }
        })
    },

    markAsRead: async (id) => {
        // Optimistic update
        get().updateRealtimeNotification(id, { status: 'read' })
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
        } catch (error) {
            console.error('Failed to mark read:', error)
        }
    },

    markAllAsRead: async () => {
        // Optimistic update
        set((state) => ({
            notifications: state.notifications.map(n =>
                n.status === 'unread' ? { ...n, status: 'read' as const } : n
            )
        }))
        try {
            await fetch('/api/notifications/read-all', { method: 'PATCH' })
        } catch (error) {
            console.error('Failed to mark all read:', error)
        }
    },

    acknowledgeNotification: async (id) => {
        // Optimistic update
        get().updateRealtimeNotification(id, { status: 'acknowledged' })
        try {
            await fetch(`/api/notifications/${id}/acknowledge`, { method: 'PATCH' })
        } catch (error) {
            console.error('Failed to acknowledge:', error)
        }
    },

    clearAll: async () => {
        set({ notifications: [], activeSound: false })
        try {
            await fetch('/api/notifications', { method: 'DELETE' })
        } catch (error) {
            console.error('Failed to clear notifications:', error)
        }
    },

    getUnreadCount: () => {
        return get().notifications.filter(n => n.status === 'unread').length
    },

    // Legacy support
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addNotification: (notification: any) => {
        const fullNotification: AppNotification = {
            status: 'unread',
            createdAt: Date.now(),
            ...notification,
        }
        set(state => {
            const newNotifs = [fullNotification, ...state.notifications]
            return {
                notifications: newNotifs,
                activeSound: checkCriticalSound(newNotifs)
            }
        })
    }
}))
