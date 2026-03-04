"use client"

import React from 'react'
import { useNotificationStore } from '@/lib/store/notification-store'
import { useNotificationSound } from '@/hooks/use-notification-sound'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const activeSound = useNotificationStore(state => state.activeSound)

    useNotificationSound(activeSound)

    return <>{children}</>
}
