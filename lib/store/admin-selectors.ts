import { useAuthStore } from './auth-store'
import { useAdminAnalyticsStore } from './admin-analytics-store'
import { useRequestStore } from './request-store'
import { useInventoryStore } from './inventory-store'
import { useDiscoveryStore } from './discovery-store'
import { useNotificationStore } from './notification-store'
import { useShallow } from 'zustand/react/shallow'

export function useAdminMetrics() {
    const isAuthenticated = useAuthStore(useShallow(state => state.isAuthenticated))
    const requests = useRequestStore(useShallow(state => state.requests))
    const inventory = useInventoryStore(useShallow(state => state.items))
    const discoveryState = useDiscoveryStore(useShallow(state => state))
    const notifications = useNotificationStore(useShallow(state => state.notifications))

    const { metrics } = useAdminAnalyticsStore()

    // Aggregate values
    const totalBloodBanks = metrics?.total_blood_banks || (Array.isArray((discoveryState as unknown as Record<string, unknown>).bloodBanks) ? ((discoveryState as unknown as Record<string, unknown>).bloodBanks as unknown[]).length : 12)
    const totalHospitals = metrics?.total_hospitals || (new Set(requests.map(r => r.hospitalName)).size || 45)
    const activeUsers = metrics?.active_users || (isAuthenticated ? 1 : 0)
    const totalRequests = metrics?.total_requests || requests.length
    const activeEmergencyRequests = metrics?.active_emergency_requests || notifications.filter(n => n.priority === 'critical' && n.status !== 'read' && n.status !== 'acknowledged').length

    // System Health Heuristic:
    let score = 100
    const expiredInventoryCount = inventory.filter(item => item.status === 'expired').length
    score -= (expiredInventoryCount * 10)

    const _now = new Date().getTime()
    const stuckRequestsCount = requests.filter(r => {
        if (r.status === 'sent') {
            const sentEvent = r.timeline?.find(t => t.status === 'sent')
            if (sentEvent) {
                return (_now - sentEvent.timestamp) > 10 * 60 * 1000 // > 10 minutes
            }
        }
        return false
    }).length
    score -= (stuckRequestsCount * 5)

    // Additional penalty if there are more pending requests than fulfilled requests roughly.
    if (metrics && metrics.pending_requests > 10 && metrics.pending_requests > metrics.fulfilled_requests) {
        score -= 10
    }

    const systemHealthScore = Math.max(0, Math.min(100, score))

    // Helper data for recent activity
    const recentRequests = [...requests]
        .sort((a, b) => {
            const aTime = a.timeline?.[a.timeline.length - 1]?.timestamp || 0
            const bTime = b.timeline?.[b.timeline.length - 1]?.timestamp || 0
            return bTime - aTime
        })
        .slice(0, 5)

    const recentInventoryEvents = notifications
        .filter(n => n.id.includes('expiry') || n.id.includes('expired') || n.title.includes('Unit'))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)

    return {
        totalBloodBanks,
        totalHospitals,
        activeUsers,
        totalRequests,
        activeEmergencyRequests,
        systemHealthScore,
        recentRequests,
        recentInventoryEvents
    }
}
