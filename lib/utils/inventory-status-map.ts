import { InventoryStatus } from "@/types/inventory"

export function getInventoryBadgeVariant(status: InventoryStatus): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "available": return "default"
        case "reserved": return "secondary"
        case "near-expiry": return "outline"
        case "expired": return "destructive"
        default: return "outline"
    }
}

export function getInventoryBadgeClass(status: InventoryStatus): string {
    switch (status) {
        case "available": return "bg-emerald-500 hover:bg-emerald-600 border-emerald-500"
        case "reserved": return "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
        case "near-expiry": return "border-amber-500 text-amber-700 bg-amber-50"
        case "expired": return "opacity-80"
        default: return ""
    }
}
