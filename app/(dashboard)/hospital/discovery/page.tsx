import { Metadata } from "next"
import { DiscoveryClient } from "./discovery-client"

export const metadata: Metadata = {
    title: "Blood Bank Discovery | BloodConnect",
    description: "Find nearby blood banks and check real-time availability.",
}

export default function DiscoveryPage() {
    return <DiscoveryClient />
}
