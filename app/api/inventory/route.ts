import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { InventoryStatusDB } from '@/types/supabase'
import { z } from 'zod'
import { logAuditEvent } from '@/lib/audit'

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

// GET /api/inventory — Fetch inventory for current user's organization
export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Get user profile for org context
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, role')
            .eq('id', user.id)
            .single<ProfileRow>()

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
        }

        const { searchParams } = new URL(request.url)

        const getInventorySchema = z.object({
            blood_group: z.string().nullable().optional(),
            status: z.string().nullable().optional()
        })

        const parsedQuery = getInventorySchema.safeParse({
            blood_group: searchParams.get('blood_group'),
            status: searchParams.get('status')
        })

        if (!parsedQuery.success) {
            return NextResponse.json({ success: false, error: 'Invalid query parameters' }, { status: 400 })
        }

        const { blood_group: bloodGroup, status } = parsedQuery.data

        // RLS handles org filtering automatically, but for non-admin we add explicit filter
        let query = supabase
            .from('inventory')
            .select('*')
            .order('created_at', { ascending: false })

        // Admins see all; others are already filtered by RLS
        if (profile.role !== 'admin' && profile.organization_id) {
            query = query.eq('organization_id', profile.organization_id)
        }

        if (bloodGroup) {
            query = query.eq('blood_group', bloodGroup)
        }

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query.returns<InventoryRow[]>()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // Map snake_case → camelCase for frontend
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

// POST /api/inventory — Add new inventory unit
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

        // Only blood-bank and admin can add inventory
        if (profile.role !== 'admin' && profile.role !== 'blood-bank') {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
        }

        const body = await request.json()

        const addInventorySchema = z.object({
            bloodGroup: z.string().min(1, "Blood group is required"),
            componentType: z.string().min(1, "Component type is required"),
            quantity: z.number().int().positive("Quantity must be positive"),
            collectionDate: z.string().min(1, "Collection date is required"),
            expiryDate: z.string().min(1, "Expiry date is required")
        })

        const parsed = addInventorySchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
        }

        const { bloodGroup, componentType, quantity, collectionDate, expiryDate } = parsed.data

        const orgId = profile.organization_id
        if (!orgId && profile.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'No organization associated' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('inventory')
            .insert({
                organization_id: orgId!,
                blood_group: bloodGroup,
                component_type: componentType,
                quantity,
                collection_date: collectionDate,
                expiry_date: expiryDate,
            } as never)
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

        await logAuditEvent({
            action: 'ADD_INVENTORY',
            actorId: user.id,
            actorRole: profile.role,
            targetId: row.id,
            metadata: {
                bloodGroup,
                componentType,
                quantity
            }
        })

        return NextResponse.json({ success: true, data: item }, { status: 201 })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
