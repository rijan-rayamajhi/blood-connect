import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ProfileRow {
    organization_id: string | null
    role: string
}

interface SystemConfigRow {
    low_stock_threshold: number
}

// GET /api/inventory/low-stock — Return blood groups below low stock threshold
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

        // Get threshold from system_config
        const { data: config } = await supabase
            .from('system_config')
            .select('low_stock_threshold')
            .eq('id', 1)
            .single<SystemConfigRow>()

        const threshold = config?.low_stock_threshold ?? 10

        // Fetch available/near-expiry inventory for the user's org
        let query = supabase
            .from('inventory')
            .select('blood_group, quantity')
            .in('status', ['available', 'near-expiry'])

        if (profile.role !== 'admin' && profile.organization_id) {
            query = query.eq('organization_id', profile.organization_id)
        }

        const { data: items, error } = await query.returns<{ blood_group: string; quantity: number }[]>()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // Group by blood_group and sum quantities
        const balances: Record<string, number> = {}
        for (const item of items || []) {
            balances[item.blood_group] = (balances[item.blood_group] || 0) + item.quantity
        }

        const lowStockGroups = Object.entries(balances)
            .filter(([, qty]) => qty < threshold)
            .map(([group, quantity]) => ({ group, quantity }))

        return NextResponse.json({ success: true, data: lowStockGroups, threshold })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
