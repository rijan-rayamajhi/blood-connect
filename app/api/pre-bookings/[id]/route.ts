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

// ── PATCH /api/pre-bookings/[id] ──────────────────────────────────────────────
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { bloodGroup, componentType, quantity, scheduledDate, notes, status, autoConvert } = body

        // Build patch object — only include provided fields
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const patch: Record<string, any> = {}
        if (bloodGroup !== undefined) patch.blood_group = bloodGroup
        if (componentType !== undefined) patch.component_type = componentType
        if (quantity !== undefined) patch.quantity = quantity
        if (scheduledDate !== undefined) patch.scheduled_date = scheduledDate
        if (notes !== undefined) patch.notes = notes
        if (status !== undefined) patch.status = status
        if (autoConvert !== undefined) patch.auto_convert = autoConvert

        if (Object.keys(patch).length === 0) {
            return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
        }

        // Validate status transition if provided
        if (patch.status && !['scheduled', 'fulfilled', 'cancelled'].includes(patch.status)) {
            return NextResponse.json({ success: false, error: 'Invalid status value' }, { status: 400 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('pre_bookings')
            .update(patch)
            .eq('id', id)
            .select('*')
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ success: false, error: 'Pre-booking not found or access denied' }, { status: 404 })
            }
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: mapRow(data) })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

// ── DELETE /api/pre-bookings/[id] ─────────────────────────────────────────────
// Soft-delete: sets status to 'cancelled'
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('pre_bookings')
            .update({ status: 'cancelled' })
            .eq('id', id)
            .eq('status', 'scheduled') // Only allow cancelling scheduled bookings
            .select('*')
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ success: false, error: 'Pre-booking not found, already cancelled, or access denied' }, { status: 404 })
            }
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: mapRow(data) })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
