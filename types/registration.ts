export type RegistrationStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "suspended"

export interface OrganizationRegistration {
    id: string
    name: string
    type: "hospital" | "blood-bank"
    email: string
    documents: {
        licenseUrl: string
        certificationUrl?: string
    }
    status: RegistrationStatus
    submittedAt: number
    reviewedAt?: number
    reviewRemarks?: string
}
