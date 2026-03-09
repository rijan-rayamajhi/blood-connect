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

import { z } from 'zod'

const discoverQuerySchema = z.object({
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    radiusKm: z.coerce.number().optional().default(50.0),
    bloodGroup: z.string().nullable().optional(),
    quantity: z.coerce.number().nullable().optional(),
    maxResponseTime: z.coerce.number().nullable().optional(),
})

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

        const parsedQuery = discoverQuerySchema.safeParse({
            lat: searchParams.get('lat'),
            lng: searchParams.get('lng'),
            radiusKm: searchParams.get('radiusKm') ?? undefined,
            bloodGroup: searchParams.get('bloodGroup'),
            quantity: searchParams.get('quantity'),
            maxResponseTime: searchParams.get('maxResponseTime')
        })

        if (!parsedQuery.success) {
            return NextResponse.json(
                { success: false, error: parsedQuery.error.issues[0].message },
                { status: 400 }
            )
        }

        const { lat, lng, radiusKm, bloodGroup, quantity, maxResponseTime } = parsedQuery.data

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
