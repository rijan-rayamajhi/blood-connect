import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any) {
    return {
        id: row.id,
        hospitalId: row.hospital_id,
        bloodGroup: row.blood_group,
        componentType: row.component_type,
        quantity: row.quantity,
        scheduledDate: row.scheduled_date,
        notes: row.notes ?? null,
        status: row.status,
        autoConvert: row.auto_convert ?? false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

// ── GET /api/pre-bookings ────────────────────────────────────────────────────
export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const statusFilter = searchParams.get('status')
        const fromFilter = searchParams.get('from')
        const toFilter = searchParams.get('to')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query = (supabase as any)
            .from('pre_bookings')
            .select('*')
            .order('scheduled_date', { ascending: true })

        if (statusFilter && statusFilter !== 'all') {
            query = query.eq('status', statusFilter)
        }
        if (fromFilter) {
            query = query.gte('scheduled_date', fromFilter)
        }
        if (toFilter) {
            query = query.lte('scheduled_date', toFilter)
        }

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return NextResponse.json({ success: true, data: (data || []).map((row: any) => mapRow(row)) })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

// ── POST /api/pre-bookings ───────────────────────────────────────────────────
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('organization_id, role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'hospital') {
            return NextResponse.json({ success: false, error: 'Only hospitals can create pre-bookings' }, { status: 403 })
        }

        const orgId = profile.organization_id
        if (!orgId) {
            return NextResponse.json({ success: false, error: 'No organization associated' }, { status: 400 })
        }

        const body = await request.json()
        const { bloodGroup, componentType, quantity, scheduledDate, notes, autoConvert } = body

        if (!bloodGroup || !componentType || !quantity || !scheduledDate) {
            return NextResponse.json({ success: false, error: 'Missing required fields: bloodGroup, componentType, quantity, scheduledDate' }, { status: 400 })
        }

        if (quantity < 1) {
            return NextResponse.json({ success: false, error: 'Quantity must be at least 1' }, { status: 400 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('pre_bookings')
            .insert({
                hospital_id: orgId,
                blood_group: bloodGroup,
                component_type: componentType,
                quantity,
                scheduled_date: scheduledDate,
                notes: notes || null,
                status: 'scheduled',
                auto_convert: autoConvert ?? false,
            })
            .select('*')
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: mapRow(data) }, { status: 201 })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
