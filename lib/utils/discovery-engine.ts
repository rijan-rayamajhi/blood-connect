import { BloodBank } from "@/types/blood-bank"
import { calculateDistanceKm } from "./distance"

export interface DiscoveryFilters {
    radiusKm: number
    bloodGroup: string | null
    quantity: number | null
    maxResponseTime: number | null
    userLocation: { latitude: number; longitude: number } | null
}

export interface RankedBloodBank extends BloodBank {
    distanceKm?: number
    matchScore: number
}

export function filterAndRankBloodBanks(banks: BloodBank[], filters: DiscoveryFilters): RankedBloodBank[] {
    const scoredBanks: RankedBloodBank[] = []

    for (const bank of banks) {
        // 1. Filter by radius
        let distanceKm: number | undefined = undefined
        if (filters.userLocation) {
            distanceKm = calculateDistanceKm(
                filters.userLocation.latitude,
                filters.userLocation.longitude,
                bank.latitude,
                bank.longitude
            )
            if (distanceKm > filters.radiusKm) {
                continue // Skip if outside radius
            }
        }

        // 2. Filter by bloodGroup & quantity
        let activeInventoryQty = 0 // Track for scoring regardless of exact filter matches if group is specified
        if (filters.bloodGroup) {
            const inventoryTarget = bank.inventory.find(inv => inv.bloodGroup === filters.bloodGroup)

            if (!inventoryTarget) {
                continue // Bank does not have this group
            }

            if (filters.quantity && inventoryTarget.quantity < filters.quantity) {
                continue // Bank does not have enough quantity
            }

            activeInventoryQty = inventoryTarget.quantity
        } else {
            // If no group specified, calculate total inventory liquidity as a bonus
            activeInventoryQty = bank.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
        }

        // 3. Filter by response time
        if (filters.maxResponseTime && bank.averageResponseMinutes > filters.maxResponseTime) {
            continue
        }

        // 4. Calculate Ranking Score (Lower = Better)
        // Normalize distance (max radius limit bounds this cleanly, assume 50km max for generic bounds if no location)
        const normalizedDistance = distanceKm !== undefined ? (distanceKm / 50) : 0.5 // Default mid-measure if no location defined
        const distanceScore = normalizedDistance * 40

        // Normalize speed (Assume 60 mins is maximum boundary for practical purposes)
        const normalizedSpeed = Math.min(bank.averageResponseMinutes / 60, 1)
        const speedScore = normalizedSpeed * 40

        // Normalize inventory sufficiency (Invert it: more inventory = lower/better score. Assume 50 units is 'excellent' stock)
        const normalizedInventory = Math.max(0, 1 - (activeInventoryQty / 50))
        const inventoryScore = normalizedInventory * 20

        const totalScore = distanceScore + speedScore + inventoryScore

        scoredBanks.push({
            ...bank,
            distanceKm,
            matchScore: totalScore
        })
    }

    // Sort ascending (Lower score = better match)
    return scoredBanks.sort((a, b) => a.matchScore - b.matchScore)
}

export function getBestMatchBank(banks: BloodBank[], filters: DiscoveryFilters): RankedBloodBank | null {
    const ranked = filterAndRankBloodBanks(banks, filters)
    return ranked.length > 0 ? ranked[0] : null
}
