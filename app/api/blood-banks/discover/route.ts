import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface BloodBankQueryResult {
    id: string
    name: string
    latitude: number
    longitude: number
    distance_km: number | null
    average_response_minutes: number
    available_inventory: {
        bloodGroup: string
        quantity: number
    }[] | null
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        // Although this might be public in some apps, the discovery system is targeted 
        // towards hospitals discovering blood banks, so authentication is required.
        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)

        // Extract parameters
        const latParam = searchParams.get('lat')
        const lngParam = searchParams.get('lng')
        const radiusKmParam = searchParams.get('radiusKm')
        const bloodGroup = searchParams.get('bloodGroup')
        const quantityParam = searchParams.get('quantity')
        const maxResponseTimeParam = searchParams.get('maxResponseTime')

        // Validate basic location parameters 
        if (!latParam || !lngParam) {
            return NextResponse.json(
                { success: false, error: 'Latitude and Longitude are required for discovery.' },
                { status: 400 }
            )
        }

        const lat = parseFloat(latParam)
        const lng = parseFloat(lngParam)

        if (isNaN(lat) || isNaN(lng)) {
            return NextResponse.json(
                { success: false, error: 'Invalid coordinate values.' },
                { status: 400 }
            )
        }

        // Use defaults or parse optionals
        const radiusKm = radiusKmParam ? parseFloat(radiusKmParam) : 50.0 // Default 50km
        const quantity = quantityParam ? parseInt(quantityParam, 10) : null
        const maxResponseTime = maxResponseTimeParam ? parseInt(maxResponseTimeParam, 10) : null

        // Call PostGIS RPC 'discover_blood_banks'
        // Using @ts-expect-error since we cannot generate types easily now, and we know our RPC schema
        // @ts-expect-error - RPC types not generated yet
        const { data, error } = await supabase.rpc('discover_blood_banks', {
            hospital_lat: lat,
            hospital_lng: lng,
            radius_km: radiusKm,
            search_blood_group: bloodGroup || null,
            min_quantity: quantity,
            max_response_time: maxResponseTime
        })

        if (error) {
            console.error('RPC Error:', error)
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        const typedData = data as BloodBankQueryResult[] | null
        const mappedData = typedData?.map((bank: BloodBankQueryResult) => ({
            id: bank.id,
            name: bank.name,
            latitude: bank.latitude,
            longitude: bank.longitude,
            distanceKm: bank.distance_km ? parseFloat(bank.distance_km.toFixed(2)) : undefined,
            averageResponseMinutes: bank.average_response_minutes,
            inventory: bank.available_inventory || []
        })) || []

        return NextResponse.json({ success: true, data: mappedData })
    } catch (err: unknown) {
        console.error('Discovery API Error:', err)
        return NextResponse.json(
            { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
            { status: 500 }
        )
    }
}
