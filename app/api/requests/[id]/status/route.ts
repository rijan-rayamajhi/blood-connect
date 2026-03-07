import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
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

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
        }

        const body = await request.json()
        const { status } = body

        if (!status) {
            return NextResponse.json({ success: false, error: 'Missing status field' }, { status: 400 })
        }

        // Fetch request
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: reqData, error: reqError } = await (supabase as any)
            .from('requests')
            .select('*')
            .eq('id', id)
            .single()

        if (reqError || !reqData) {
            return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 })
        }

        // Action validation based on role
        if (profile.role === 'hospital') {
            if (reqData.hospital_id !== profile.organization_id) {
                return NextResponse.json({ success: false, error: 'Cannot modify other organization requests' }, { status: 403 })
            }
            if (status !== 'cancelled') {
                return NextResponse.json({ success: false, error: 'Hospitals can only cancel requests' }, { status: 403 })
            }
        } else if (profile.role === 'blood-bank') {
            // Note: If blood_bank_id is NULL, it's a broadcast. Accepting it assigns them as the fulfilling bank.
            if (reqData.blood_bank_id !== null && reqData.blood_bank_id !== profile.organization_id) {
                return NextResponse.json({ success: false, error: 'Request not assigned to this blood bank' }, { status: 403 })
            }
            if (!['accepted', 'partially-accepted', 'rejected', 'collected'].includes(status)) {
                return NextResponse.json({ success: false, error: 'Invalid status update for blood bank' }, { status: 403 })
            }
        } else if (profile.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
        }

        // Optional: auto-assign blood bank if broadcasted and blood bank accepts
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatePayload: any = { status }
        if (profile.role === 'blood-bank' && reqData.blood_bank_id === null && ['accepted', 'partially-accepted'].includes(status)) {
            updatePayload.blood_bank_id = profile.organization_id
        }

        // Update the request
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: updatedData, error: updateError } = await (supabase as any)
            .from('requests')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
        }

        // Handle auto-reservation for accept/partially-accept
        if (['accepted', 'partially-accepted'].includes(status)) {
            const orgId = updatePayload.blood_bank_id || reqData.blood_bank_id

            // Fetch available units
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: availableUnits } = await (supabase as any)
                .from('inventory')
                .select('id, quantity')
                .eq('organization_id', orgId)
                .eq('blood_group', reqData.blood_group)
                .eq('component_type', reqData.component_type)
                .in('status', ['available', 'near-expiry'])
                .order('expiry_date', { ascending: true })

            if (availableUnits) {
                let needed = reqData.quantity
                for (const unit of availableUnits) {
                    if (needed <= 0) break

                    // Call the RPC to reserve this unit
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase as any).rpc('reserve_inventory_unit', {
                        p_unit_id: unit.id,
                        p_request_id: reqData.id
                    })

                    needed -= unit.quantity
                }
            }
        }

        return NextResponse.json({ success: true, data: updatedData })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
