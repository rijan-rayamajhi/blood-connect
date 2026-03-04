import { RegistrationStatus } from "@/types/registration"

export type StatusType = "moderate" | "success" | "destructive" | "warning"

export const REGISTRATION_STATUS_MAP: Record<RegistrationStatus, StatusType> = {
    pending: "moderate",
    approved: "success",
    rejected: "destructive",
    suspended: "warning",
}

export function getStatusVariant(status: RegistrationStatus): StatusType {
    return REGISTRATION_STATUS_MAP[status] || "moderate"
}
