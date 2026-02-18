import { CreateRequestSheet } from "@/components/hospital/create-request-sheet"

export default function HospitalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div className="flex-1 space-y-4 p-8 pt-6">
                {/* EmergencyAlert removed temporarily */}
                {children}
            </div>
            <CreateRequestSheet />
        </>
    )
}
