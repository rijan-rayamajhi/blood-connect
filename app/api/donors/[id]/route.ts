import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ProfileRow {
    organization_id: string | null
    role: string
}

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

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, role')
            .eq('id', user.id)
            .single<ProfileRow>()

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
        }

        if (profile.role !== 'admin' && profile.role !== 'blood-bank') {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
        }

        const body = await request.json()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = {}
        if (body.fullName !== undefined) updateData.full_name = body.fullName
        if (body.bloodGroup !== undefined) updateData.blood_group = body.bloodGroup
        if (body.age !== undefined) updateData.age = body.age
        if (body.contactNumber !== undefined) updateData.contact_number = body.contactNumber
        if (body.email !== undefined) updateData.email = body.email
        if (body.lastDonationDate !== undefined) updateData.last_donation_date = body.lastDonationDate
        if (body.status !== undefined) updateData.status = body.status

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('donors')
            .update(updateData as never)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = data as any

        const item = {
            id: row.id,
            organizationId: row.organization_id,
            fullName: row.full_name,
            bloodGroup: row.blood_group,
            age: row.age,
            contactNumber: row.contact_number,
            email: row.email,
            status: row.status,
            lastDonationDate: row.last_donation_date,
            totalDonations: row.total_donations,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }

        return NextResponse.json({ success: true, data: item })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

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

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, role')
            .eq('id', user.id)
            .single<ProfileRow>()

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
        }

        if (profile.role !== 'admin' && profile.role !== 'blood-bank') {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
        }

        const { error } = await supabase
            .from('donors')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
