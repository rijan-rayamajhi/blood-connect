export type InventoryStatus =
    | "available"
    | "reserved"
    | "expired"
    | "near-expiry"

export interface BloodUnit {
    id: string
    bloodGroup: string
    componentType: string
    quantity: number
    collectionDate: string
    expiryDate: string
    status: InventoryStatus
    reservedForRequestId?: string | null
}
