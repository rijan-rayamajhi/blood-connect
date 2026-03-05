import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/inventory/[id]/release — Release a reservation
export async function POST(
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

        // Call the RPC function for atomic release
        // @ts-expect-error - RPC types might not be fully synced
        const { data, error } = await supabase.rpc('release_inventory_unit', {
            p_unit_id: id,
        })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = data as any
        if (!result?.success) {
            return NextResponse.json({ success: false, error: result?.error || 'Release failed' }, { status: 409 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
