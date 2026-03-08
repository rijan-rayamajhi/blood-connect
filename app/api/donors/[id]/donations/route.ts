import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ProfileRow {
    organization_id: string | null
    role: string
}

export async function GET(
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

        const { data, error } = await supabase
            .from('donor_donations')
            .select('*')
            .eq('donor_id', id)
            .order('donation_date', { ascending: false })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (data || []).map((row: any) => ({
            id: row.id,
            donorId: row.donor_id,
            donationDate: row.donation_date,
            bloodGroup: row.blood_group,
            componentType: row.component_type,
            quantity: row.quantity,
            notes: row.notes,
            createdAt: row.created_at,
        }))

        return NextResponse.json({ success: true, data: items })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

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
        const { donationDate, componentType, quantity, notes } = body

        if (!donationDate || !componentType || !quantity) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        // Fetch donor to verify it exists and get blood_group
        const { data: donorResult, error: donorError } = await supabase
            .from('donors')
            .select('*')
            .eq('id', id)
            .single()

        if (donorError || !donorResult) {
            return NextResponse.json({ success: false, error: 'Donor not found' }, { status: 404 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const donor = donorResult as any;

        // Insert donation
        const { data: donationResult, error: insertError } = await supabase
            .from('donor_donations')
            .insert({
                donor_id: id,
                donation_date: donationDate,
                blood_group: donor.blood_group,
                component_type: componentType,
                quantity: quantity,
                notes: notes || null
            } as never)
            .select()
            .single()

        if (insertError) {
            return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
        }

        // Update donor stats (last_donation_date, total_donations, status is handled by trigger if date changes, 
        // wait the trigger check_donor_eligibility runs ON UPDATE OF donors. So we MUST update donor here)
        // Check if this donation date is the latest one
        const isLatest = !donor.last_donation_date || new Date(donationDate) >= new Date(donor.last_donation_date);

        await supabase
            .from('donors')
            .update({
                total_donations: donor.total_donations + 1,
                ...(isLatest ? { last_donation_date: donationDate } : {})
            } as never)
            .eq('id', id)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const donation = donationResult as any;

        const item = {
            id: donation.id,
            donorId: donation.donor_id,
            donationDate: donation.donation_date,
            bloodGroup: donation.blood_group,
            componentType: donation.component_type,
            quantity: donation.quantity,
            notes: donation.notes,
            createdAt: donation.created_at,
        }

        return NextResponse.json({ success: true, data: item }, { status: 201 })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
