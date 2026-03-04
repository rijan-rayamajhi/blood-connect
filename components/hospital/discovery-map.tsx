"use client"

import * as React from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { RankedBloodBank } from "@/lib/utils/discovery-engine"

// ── Fix Leaflet default icon issue in bundlers ───────────────────────────────

const defaultIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

const selectedIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -40],
    shadowSize: [49, 49],
    className: "hue-rotate-[200deg] brightness-125",
})

const userIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
    className: "hue-rotate-[120deg] saturate-200",
})

// ── Types ────────────────────────────────────────────────────────────────────

interface DiscoveryMapProps {
    banks: RankedBloodBank[]
    userLocation: { latitude: number; longitude: number } | null
    selectedBankId?: string
    onSelectBank?: (id: string) => void
}

// ── Map center updater ───────────────────────────────────────────────────────

function MapCenterUpdater({
    center,
}: {
    center: [number, number]
}) {
    const map = useMap()
    React.useEffect(() => {
        map.setView(center, map.getZoom())
    }, [center, map])
    return null
}

// ── Default fallback center (New Delhi) ──────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209]
const DEFAULT_ZOOM = 12

// ── Component ────────────────────────────────────────────────────────────────

export function DiscoveryMap({
    banks,
    userLocation,
    selectedBankId,
    onSelectBank,
}: DiscoveryMapProps) {
    const center: [number, number] = userLocation
        ? [userLocation.latitude, userLocation.longitude]
        : DEFAULT_CENTER

    return (
        <div
            className="w-full rounded-lg overflow-hidden border"
            style={{ minHeight: "400px", height: "100%" }}
            aria-label="Blood bank discovery map"
            role="region"
        >
            <MapContainer
                center={center}
                zoom={DEFAULT_ZOOM}
                scrollWheelZoom
                className="h-full w-full"
                style={{ minHeight: "400px", height: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapCenterUpdater center={center} />

                {/* User location marker */}
                {userLocation && (
                    <Marker
                        position={[
                            userLocation.latitude,
                            userLocation.longitude,
                        ]}
                        icon={userIcon}
                    >
                        <Popup>
                            <strong>Your Location</strong>
                        </Popup>
                    </Marker>
                )}

                {/* Blood bank markers */}
                {banks.map((bank) => {
                    const isSelected = bank.id === selectedBankId
                    const totalUnits = bank.inventory.reduce(
                        (sum, inv) => sum + inv.quantity,
                        0
                    )

                    return (
                        <Marker
                            key={bank.id}
                            position={[bank.latitude, bank.longitude]}
                            icon={isSelected ? selectedIcon : defaultIcon}
                            eventHandlers={{
                                click: () => onSelectBank?.(bank.id),
                            }}
                        >
                            <Popup>
                                <div className="min-w-[180px] space-y-1.5 text-sm">
                                    <p className="font-semibold text-base">
                                        {bank.name}
                                    </p>
                                    {bank.distanceKm !== undefined && (
                                        <p className="text-muted-foreground">
                                            📍 {bank.distanceKm} km away
                                        </p>
                                    )}
                                    <p className="text-muted-foreground">
                                        ⏱ ~{bank.averageResponseMinutes} min
                                        response
                                    </p>
                                    <p className="text-muted-foreground">
                                        🩸 {totalUnits} units available
                                    </p>
                                    {bank.inventory.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {bank.inventory.map((inv) => (
                                                <span
                                                    key={inv.bloodGroup}
                                                    className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800"
                                                >
                                                    {inv.bloodGroup}: {inv.quantity}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
        </div>
    )
}
