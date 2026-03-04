export type RequestStatus =
    | "sent"
    | "accepted"
    | "partially-accepted"
    | "rejected"
    | "collected"
    | "cancelled"

export type RequestUrgency = "critical" | "moderate" | "normal"

export const REQUEST_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
    sent: ["accepted", "partially-accepted", "rejected", "cancelled"],
    accepted: ["collected"],
    "partially-accepted": ["collected", "cancelled"],
    rejected: [],
    collected: [],
    cancelled: []
}
