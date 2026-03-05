import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { InventoryStatusDB } from '@/types/supabase'

interface ProfileRow {
    organization_id: string | null
    role: string
}

interface InventoryRow {
    id: string
    organization_id: string
    blood_group: string
    component_type: string
    quantity: number
    collection_date: string
    expiry_date: string
    status: InventoryStatusDB
    reserved_for_request_id: string | null
    created_at: string
    updated_at: string
}

// GET /api/inventory/near-expiry — Return units expiring within 48 hours
export async function GET() {
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

        let query = supabase
            .from('inventory')
            .select('*')
            .eq('status', 'near-expiry')
            .order('expiry_date', { ascending: true })

        if (profile.role !== 'admin' && profile.organization_id) {
            query = query.eq('organization_id', profile.organization_id)
        }

        const { data, error } = await query.returns<InventoryRow[]>()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        const items = (data || []).map(row => ({
            id: row.id,
            organizationId: row.organization_id,
            bloodGroup: row.blood_group,
            componentType: row.component_type,
            quantity: row.quantity,
            collectionDate: row.collection_date,
            expiryDate: row.expiry_date,
            status: row.status,
            reservedForRequestId: row.reserved_for_request_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }))

        return NextResponse.json({ success: true, data: items })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
