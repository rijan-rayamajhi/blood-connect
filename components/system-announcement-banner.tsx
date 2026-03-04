"use client"

import { useSystemConfigStore } from "@/lib/store/system-config-store"
import { useShallow } from "zustand/react/shallow"
import { AlertCircle, X, Megaphone, Info } from "lucide-react"

export function SystemAnnouncementBanner() {
    const { message, priority, clearAnnouncement } = useSystemConfigStore(useShallow(state => ({
        message: state.config.announcementMessage,
        priority: state.config.announcementPriority,
        clearAnnouncement: state.clearAnnouncement
    })))

    if (!message || !priority) return null

    const baseClasses = "w-full py-2.5 px-4 flex items-center justify-between text-sm sm:text-base font-medium z-50 border-b relative"

    const priorityConfig = {
        normal: {
            bg: "bg-blue-500/10 dark:bg-blue-500/20",
            text: "text-blue-700 dark:text-blue-300",
            border: "border-blue-500/20",
            icon: <Info className="h-5 w-5 flex-shrink-0" />
        },
        moderate: {
            bg: "bg-amber-500/10 dark:bg-amber-500/20",
            text: "text-amber-700 dark:text-amber-400",
            border: "border-amber-500/20",
            icon: <AlertCircle className="h-5 w-5 flex-shrink-0" />
        },
        critical: {
            bg: "bg-red-500 text-white",
            text: "text-white",
            border: "border-red-600",
            icon: <Megaphone className="h-5 w-5 flex-shrink-0 animate-pulse" />
        }
    }

    const currentConfig = priorityConfig[priority]

    return (
        <div className={`${baseClasses} ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border}`}>
            <div className="flex items-center gap-3 w-full justify-center text-center">
                {currentConfig.icon}
                <span className="flex-1 lg:flex-none">
                    <strong className="uppercase mr-2 opacity-80">{priority} Broadcast:</strong>
                    {message}
                </span>
            </div>

            <button
                onClick={clearAnnouncement}
                className={`absolute right-4 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity ${priority === 'critical' ? 'hover:bg-red-600' : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                aria-label="Dismiss Announcement"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    )
}
