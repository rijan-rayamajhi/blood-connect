import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
        }

        // RLS will automatically filter requests for hospitals and blood banks based on policies
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('requests')
            .select(`
                *,
                hospital:organizations!hospital_id(name),
                blood_bank:organizations!blood_bank_id(name),
                timeline:request_timeline(status, timestamp)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // Map data to match the frontend expectations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requests = (data || []).map((row: any) => ({
            id: row.id,
            hospitalId: row.hospital_id,
            hospitalName: row.hospital?.name || 'Unknown Hospital',
            bloodBankId: row.blood_bank_id,
            bloodGroup: row.blood_group,
            componentType: row.component_type,
            quantity: row.quantity,
            urgency: row.urgency,
            requiredDate: row.required_date,
            status: row.status,
            requestDate: row.created_at,
            prescriptionFileId: row.prescription_file_id,
            overridden: row.overridden,
            overrideReason: row.override_reason,
            overriddenAt: row.overridden_at ? new Date(row.overridden_at).getTime() : undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            timeline: (row.timeline || []).map((t: any) => ({
                status: t.status,
                timestamp: new Date(t.timestamp).getTime()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })).sort((a: any, b: any) => a.timestamp - b.timestamp)
        }))

        return NextResponse.json({ success: true, data: requests })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

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
            return NextResponse.json({ success: false, error: 'Only hospitals can create requests' }, { status: 403 })
        }

        const body = await request.json()
        const { bloodGroup, componentType, quantity, urgency, requiredDate, prescriptionFileId, bloodBankId } = body

        if (!bloodGroup || !componentType || !quantity || !urgency || !requiredDate) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        const orgId = profile.organization_id
        if (!orgId) {
            return NextResponse.json({ success: false, error: 'No organization associated' }, { status: 400 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('requests')
            .insert({
                hospital_id: orgId,
                blood_bank_id: bloodBankId || null,
                blood_group: bloodGroup,
                component_type: componentType,
                quantity,
                urgency,
                required_date: requiredDate,
                prescription_file_id: prescriptionFileId || null,
                status: 'sent'
            })
            .select(`
                *,
                hospital:organizations!hospital_id(name),
                blood_bank:organizations!blood_bank_id(name),
                timeline:request_timeline(status, timestamp)
            `)
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = data as any
        const newRequest = {
            id: row.id,
            hospitalId: row.hospital_id,
            hospitalName: row.hospital?.name || 'Unknown Hospital',
            bloodBankId: row.blood_bank_id,
            bloodGroup: row.blood_group,
            componentType: row.component_type,
            quantity: row.quantity,
            urgency: row.urgency,
            requiredDate: row.required_date,
            status: row.status,
            requestDate: row.created_at,
            prescriptionFileId: row.prescription_file_id,
            overridden: row.overridden,
            overrideReason: row.override_reason,
            overriddenAt: row.overridden_at ? new Date(row.overridden_at).getTime() : undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            timeline: (row.timeline || []).map((t: any) => ({
                status: t.status,
                timestamp: new Date(t.timestamp).getTime()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })).sort((a: any, b: any) => a.timestamp - b.timestamp)
        }

        return NextResponse.json({ success: true, data: newRequest }, { status: 201 })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
