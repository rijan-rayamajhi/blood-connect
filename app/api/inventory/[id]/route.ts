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

// PATCH /api/inventory/[id] — Update an inventory unit
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

        // Build update payload — only include provided fields
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = {}
        if (body.bloodGroup !== undefined) updateData.blood_group = body.bloodGroup
        if (body.componentType !== undefined) updateData.component_type = body.componentType
        if (body.quantity !== undefined) updateData.quantity = body.quantity
        if (body.collectionDate !== undefined) updateData.collection_date = body.collectionDate
        if (body.expiryDate !== undefined) updateData.expiry_date = body.expiryDate

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('inventory')
            .update(updateData as never)
            .eq('id', id)
            .select()
            .single<InventoryRow>()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        const row = data!
        const item = {
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
        }

        return NextResponse.json({ success: true, data: item })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/inventory/[id] — Delete an inventory unit
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
            .from('inventory')
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
