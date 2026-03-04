"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { DiscoveryFilters } from "@/components/hospital/discovery-filters"
import { BloodBankCard } from "@/components/hospital/blood-bank-card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Map, SearchX, MapPin, Loader2, ShieldAlert } from "lucide-react"
import { ViewToggle } from "@/components/hospital/view-toggle"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { useDiscoveryStore } from "@/lib/store/discovery-store"
import { filterAndRankBloodBanks } from "@/lib/utils/discovery-engine"
import { useGeolocation } from "@/hooks/use-geolocation"
import { BloodBank } from "@/types/blood-bank"

// Dynamic import for map (SSR-incompatible)
const DiscoveryMap = dynamic(
    () =>
        import("@/components/hospital/discovery-map").then(
            (mod) => mod.DiscoveryMap
        ),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full min-h-[400px] rounded-lg border bg-muted/20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        ),
    }
)

// Simulated database response
const mockBloodBanks: BloodBank[] = [
    {
        id: "BB-001",
        name: "City Central Blood Bank",
        latitude: 28.6139,
        longitude: 77.2090,
        averageResponseMinutes: 10,
        inventory: [
            { bloodGroup: "A+", quantity: 20 },
            { bloodGroup: "B+", quantity: 15 },
            { bloodGroup: "O+", quantity: 45 },
            { bloodGroup: "AB+", quantity: 5 }
        ]
    },
    {
        id: "BB-002",
        name: "Red Cross Society",
        latitude: 28.6250,
        longitude: 77.2450,
        averageResponseMinutes: 25,
        inventory: [
            { bloodGroup: "O-", quantity: 8 },
            { bloodGroup: "A-", quantity: 4 },
            { bloodGroup: "B-", quantity: 3 },
            { bloodGroup: "AB-", quantity: 1 },
            { bloodGroup: "A+", quantity: 50 },
            { bloodGroup: "B+", quantity: 40 },
            { bloodGroup: "O+", quantity: 100 },
            { bloodGroup: "AB+", quantity: 20 }
        ]
    },
    {
        id: "BB-003",
        name: "St. Mary's Hospital",
        latitude: 28.5900,
        longitude: 77.1900,
        averageResponseMinutes: 18,
        inventory: [
            { bloodGroup: "A+", quantity: 10 },
            { bloodGroup: "B+", quantity: 25 },
            { bloodGroup: "O+", quantity: 30 }
        ]
    },
    {
        id: "BB-004",
        name: "Community Health Center",
        latitude: 28.6500,
        longitude: 77.1500,
        averageResponseMinutes: 35,
        inventory: []
    },
    {
        id: "BB-005",
        name: "Global Blood Bank",
        latitude: 28.7000,
        longitude: 77.2800,
        averageResponseMinutes: 45,
        inventory: [
            { bloodGroup: "AB+", quantity: 12 },
            { bloodGroup: "AB-", quantity: 6 }
        ]
    }
]

export function DiscoveryClient() {
    // For demo purposes, set a default user location somewhere centrally relative to the mock data.
    // In production, this would be set via browser Geolocation API triggering store.setUserLocation()
    const defaultUserLocation = { latitude: 28.6100, longitude: 77.2000 }

    // Geolocation hook
    const {
        location: geoLocation,
        loading: geoLoading,
        error: geoError,
        requestPermission,
    } = useGeolocation()

    // Discovery store
    const { setUserLocation } = useDiscoveryStore()

    // Sync geolocation to store when available
    const effectiveUserLocation = geoLocation
        ? { latitude: geoLocation.latitude, longitude: geoLocation.longitude }
        : defaultUserLocation

    // Push to store whenever geo updates
    if (geoLocation) {
        setUserLocation(geoLocation.latitude, geoLocation.longitude)
    }

    // Subscribe to store filters with shallow tracking
    const filters = useDiscoveryStore((state) => ({
        radiusKm: state.radiusKm,
        bloodGroup: state.bloodGroup,
        quantity: state.quantity,
        maxResponseTime: state.maxResponseTime,
        userLocation: state.userLocation || effectiveUserLocation
    }))

    // Map selection state
    const [selectedBankId, setSelectedBankId] = useState<string | undefined>()

    // Calculate ranked list ONLY when filters change (Performance optimization per DRD requirement)
    const rankedResults = useMemo(() => {
        return filterAndRankBloodBanks(mockBloodBanks, filters)
    }, [filters])

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
                    {/* 3. View Toggle + Location Controls */}
                    <Tabs defaultValue="list" className="h-full flex flex-col">
                        <div className="flex items-center justify-between shrink-0 mb-4 flex-wrap gap-3">
                            <ViewToggle />

                            {/* Location controls */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={requestPermission}
                                    disabled={geoLoading}
                                    aria-label="Use my current location for discovery"
                                >
                                    {geoLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <MapPin className="h-4 w-4" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {geoLocation
                                            ? "Location Updated"
                                            : "Use My Location"}
                                    </span>
                                    <span className="sm:hidden">
                                        {geoLocation ? "Updated" : "Locate"}
                                    </span>
                                </Button>

                                {/* Permission state indicator */}
                                {geoLocation && (
                                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        Live location active
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Denied banner */}
                        {geoError === "denied" && (
                            <div
                                className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 mb-4 text-sm"
                                role="alert"
                                aria-live="polite"
                            >
                                <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
                                <p className="text-destructive">
                                    Location permission was denied. Results are
                                    shown using a default location. To enable,
                                    update your browser&apos;s location
                                    settings.
                                </p>
                            </div>
                        )}

                        {geoError && geoError !== "denied" && (
                            <div
                                className="flex items-center gap-3 rounded-md border border-orange-300/30 bg-orange-50 dark:bg-orange-900/10 px-4 py-3 mb-4 text-sm"
                                role="alert"
                                aria-live="polite"
                            >
                                <ShieldAlert className="h-4 w-4 text-orange-500 shrink-0" />
                                <p className="text-orange-700 dark:text-orange-400">
                                    {geoError === "unsupported"
                                        ? "Geolocation is not supported by your browser. Showing results from default location."
                                        : geoError === "timeout"
                                            ? "Location request timed out. Please try again."
                                            : "Unable to determine your location. Showing results from default location."}
                                </p>
                            </div>
                        )}

                        {/* 4. Results Container - List View */}
                        <TabsContent value="list" className="flex-1 overflow-y-auto mt-0">
                            {rankedResults.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 pr-2 pb-4">
                                    {rankedResults.map((bank, index) => (
                                        <BloodBankCard
                                            key={bank.id}
                                            name={bank.name}
                                            distance={bank.distanceKm !== undefined ? `${bank.distanceKm} km` : "N/A"}
                                            time={`${bank.averageResponseMinutes} mins`}
                                            phone={"+91 98765 00000"} // Mocked generic phone for now
                                            availableGroups={bank.inventory.map(inv => inv.bloodGroup)}
                                            type={"Blood Bank"}
                                            reliability={90 + (10 - index)} // Mock reliability based loosely on matching performance
                                            isBestMatch={index === 0} // Highest rank is best match
                                        />
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

                        {/* 5. Map View */}
                        <TabsContent value="map" className="flex-1 overflow-hidden mt-0">
                            <DiscoveryMap
                                banks={rankedResults}
                                userLocation={effectiveUserLocation}
                                selectedBankId={selectedBankId}
                                onSelectBank={setSelectedBankId}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
