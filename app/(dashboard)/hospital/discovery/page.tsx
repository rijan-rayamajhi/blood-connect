import { Metadata } from "next"
import { DiscoveryFilters } from "@/components/hospital/discovery-filters"
import { BloodBankCard } from "@/components/hospital/blood-bank-card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Map, SearchX } from "lucide-react"
import { ViewToggle } from "@/components/hospital/view-toggle"
import { EmptyState } from "@/components/ui/empty-state"

export const metadata: Metadata = {
    title: "Blood Bank Discovery | BloodConnect",
    description: "Find nearby blood banks and check real-time availability.",
}

const mockBloodBanks = [
    {
        id: 1,
        name: "City Central Blood Bank",
        distance: "2.5 km",
        time: "10 mins",
        phone: "+91 98765 43210",
        availableGroups: ["A+", "B+", "O+", "AB+"],
        type: "Government",
        reliability: 98,
        isBestMatch: true
    },
    {
        id: 2,
        name: "Red Cross Society",
        distance: "5.0 km",
        time: "25 mins",
        phone: "+91 98765 43211",
        availableGroups: ["O-", "A-", "B-", "AB-", "A+", "B+", "O+", "AB+"],
        type: "Red Cross",
        reliability: 95
    },
    {
        id: 3,
        name: "St. Mary's Hospital",
        distance: "3.8 km",
        time: "18 mins",
        phone: "+91 98765 43212",
        availableGroups: ["A+", "B+", "O+"],
        type: "Private",
        reliability: 88
    },
    {
        id: 4,
        name: "Community Health Center",
        distance: "8.2 km",
        time: "35 mins",
        phone: "+91 98765 43213",
        availableGroups: [],
        type: "Clinic",
        reliability: 75
    },
    {
        id: 5,
        name: "Global Blood Bank",
        distance: "12 km",
        time: "45 mins",
        phone: "+91 98765 43214",
        availableGroups: ["AB+", "AB-"],
        type: "Private",
        reliability: 92
    }
]

export default function DiscoveryPage() {
    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
            {/* 1. Page Header */}
            <div className="flex flex-col gap-2 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight">Blood Bank Discovery</h1>
                <p className="text-muted-foreground">
                    Search nearby blood banks and check live inventory availability.
                </p>
            </div>

            <div className="flex flex-col h-full overflow-hidden gap-6">
                {/* 2. Filter Bar (Top) */}
                <div className="shrink-0">
                    <DiscoveryFilters />
                </div>

                <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                    {/* 3. View Toggle Container */}
                    <Tabs defaultValue="list" className="h-full flex flex-col">
                        <div className="flex items-center justify-between shrink-0 mb-4">
                            <ViewToggle />
                        </div>

                        {/* 4. Results Container */}
                        <TabsContent value="list" className="flex-1 overflow-y-auto mt-0">
                            {mockBloodBanks.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 pr-2 pb-4">
                                    {mockBloodBanks.map((bank) => (
                                        <BloodBankCard key={bank.id} {...bank} />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center p-6">
                                    <EmptyState
                                        icon={SearchX}
                                        title="No blood banks found"
                                        description="We couldn't find any blood banks matching your filters. Try adjusting your search criteria or increasing the distance."
                                        actionLabel="Clear Filters"
                                        onAction={() => console.log("Reset filters")}
                                    />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="map" className="flex-1 overflow-hidden mt-0 rounded-lg border bg-muted/20 relative">
                            <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground">
                                <Map className="h-16 w-16 mb-4 opacity-20" />
                                <p>Map View Integration Pending</p>
                                <p className="text-sm">(Google Maps / Mapbox)</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
