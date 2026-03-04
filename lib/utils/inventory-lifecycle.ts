import { BloodUnit, InventoryStatus } from "@/types/inventory"

export function classifyUnitStatus(unit: Omit<BloodUnit, "status"> & { status?: InventoryStatus }): InventoryStatus {
    const now = new Date()
    const expiry = new Date(unit.expiryDate)

    // Normalize times to compare dates properly (optional, but good for precise expiry vs near-expiry)
    // For direct comparison based on timestamp:
    if (now.getTime() > expiry.getTime()) {
        return "expired"
    }

    const diffMs = expiry.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours <= 48) {
        return "near-expiry"
    }

    if (unit.reservedForRequestId) {
        return "reserved"
    }

    return "available"
}

export function getDaysUntilExpiry(expiryDate: string): number {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diffMs = expiry.getTime() - now.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function getFIFORecommendation(units: BloodUnit[]): BloodUnit | null {
    const availableUnits = units.filter(u => u.status === "available" || u.status === "near-expiry")
    if (availableUnits.length === 0) return null

    return availableUnits.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0]
}
