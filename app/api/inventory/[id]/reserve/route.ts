import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/inventory/[id]/reserve — Atomically reserve a unit
export async function POST(
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
        const { requestId } = body

        if (!requestId) {
            return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 })
        }

        // Call the RPC function for atomic reservation
        // @ts-expect-error - RPC types might not be fully synced in the local TS context yet
        const { data, error } = await supabase.rpc('reserve_inventory_unit', {
            p_unit_id: id,
            p_request_id: requestId,
        })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = data as any
        if (!result?.success) {
            return NextResponse.json({ success: false, error: result?.error || 'Reservation failed' }, { status: 409 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
