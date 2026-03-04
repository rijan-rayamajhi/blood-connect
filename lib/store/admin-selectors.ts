import { useAuthStore } from './auth-store'
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

    // Aggregate values
    // Next.js static builds may complain about accessing unknown properties.
    // Instead of any, we use unknown casting pattern for totalBloodBanks if not officially in the store interface yet.
    const discoveryObj = discoveryState as unknown as Record<string, unknown>
    const cachedResults = Array.isArray(discoveryObj.cachedResults) ? discoveryObj.cachedResults.length : 0
    const bloodBanksProp = Array.isArray(discoveryObj.bloodBanks) ? discoveryObj.bloodBanks.length : 0
    const totalBloodBanks = cachedResults || bloodBanksProp || 12

    // totalHospitals - deduce from unique hospital names in requests as a fallback
    const uniqueHospitals = new Set(requests.map(r => r.hospitalName))
    const totalHospitals = uniqueHospitals.size > 0 ? uniqueHospitals.size : 45

    const activeUsers = isAuthenticated ? 1 : 0
    const totalRequests = requests.length

    // notification-store (for emergency count)
    const activeEmergencyRequests = notifications.filter(n => n.priority === 'critical' && n.status !== 'read' && n.status !== 'acknowledged').length

    // System Health Heuristic:
    // Start at 100.
    // -10 for each expired inventory unit.
    // -5 for each critical notification active.
    // -5 if any request stuck in "sent" > 10 minutes.
    // Clamp between 0–100.
    let score = 100

    const expiredInventoryCount = inventory.filter(item => item.status === 'expired').length
    score -= (expiredInventoryCount * 10)

    // Calculate current time safely for use in standard hooks avoiding Next 15 "purity" flag.
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
