import { RequestStatus } from "@/types/request"

export function getStatusBadgeVariant(status: RequestStatus): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "sent":
        case "cancelled":
            return "outline" // neutral
        case "accepted":
        case "collected":
            return "default" // success equivalent
        case "partially-accepted":
            return "secondary" // moderate
        case "rejected":
            return "destructive" // destructive
        default:
            return "outline"
    }
}

export function formatRequestStatus(status: RequestStatus): string {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
