import { BloodUnit } from "@/types/inventory"
import { getFIFORecommendation } from "@/lib/utils/inventory-lifecycle"

export function getRecommendedFIFOUnit(items: BloodUnit[]): string | null {
    const recommended = getFIFORecommendation(items)
    return recommended?.id || null
}
