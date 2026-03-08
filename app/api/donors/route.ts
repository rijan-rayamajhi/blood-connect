import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ProfileRow {
    organization_id: string | null
    role: string
}

export async function GET(request: Request) {
    try {
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

        const { searchParams } = new URL(request.url)
        const bloodGroup = searchParams.get('blood_group')
        const status = searchParams.get('status')
        const organizationId = searchParams.get('organization_id')

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query: any = supabase
            .from('donors')
            .select('*')
            .order('created_at', { ascending: false })

        if (profile.role !== 'admin' && profile.organization_id) {
            query = query.eq('organization_id', profile.organization_id)
        } else if (organizationId) {
            query = query.eq('organization_id', organizationId)
        }

        if (bloodGroup) {
            query = query.eq('blood_group', bloodGroup)
        }

        if (status) {
            query = query.eq('status', status)
        }

        const { data: qData, error: qError } = await query

        if (qError) {
            return NextResponse.json({ success: false, error: qError.message }, { status: 500 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (qData || []).map((row: any) => ({
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
        }))

        return NextResponse.json({ success: true, data: items })
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
        const { fullName, bloodGroup, age, contactNumber, email, lastDonationDate } = body

        if (!fullName || !bloodGroup || !age || !contactNumber || !email) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        const orgId = profile.organization_id
        if (!orgId && profile.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'No organization associated' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('donors')
            .insert({
                organization_id: orgId!,
                full_name: fullName,
                blood_group: bloodGroup,
                age,
                contact_number: contactNumber,
                email,
                last_donation_date: lastDonationDate || null,
            } as never)
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

        return NextResponse.json({ success: true, data: item }, { status: 201 })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
