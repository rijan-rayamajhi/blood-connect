"use client"

import { useState, useCallback } from "react"

interface GeolocationPosition {
    latitude: number
    longitude: number
}

type GeolocationError = "denied" | "unavailable" | "timeout" | "unsupported"

interface UseGeolocationReturn {
    location: GeolocationPosition | null
    loading: boolean
    error: GeolocationError | null
    requestPermission: () => void
}

export function useGeolocation(): UseGeolocationReturn {
    const [location, setLocation] = useState<GeolocationPosition | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<GeolocationError | null>(null)

    const requestPermission = useCallback(() => {
        if (typeof window === "undefined" || !("geolocation" in navigator)) {
            setError("unsupported")
            return
        }

        setLoading(true)
        setError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
                setLoading(false)
            },
            (err) => {
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError("denied")
                        break
                    case err.POSITION_UNAVAILABLE:
                        setError("unavailable")
                        break
                    case err.TIMEOUT:
                        setError("timeout")
                        break
                    default:
                        setError("unavailable")
                }
                setLoading(false)
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes cache
            }
        )
    }, [])

    return { location, loading, error, requestPermission }
}
