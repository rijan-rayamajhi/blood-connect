export interface SystemConfig {
    slaResponseMinutes: number
    emergencyEscalationMinutes: number
    stuckRequestThresholdMinutes: number
    lowStockThreshold: number
    nearExpiryHours: number
    announcementMessage: string | null
    announcementPriority: "normal" | "moderate" | "critical" | null
}
