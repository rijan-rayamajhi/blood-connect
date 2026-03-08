import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key to bypass RLS for admin metrics
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
    try {
        const { data: metrics, error: metricsError } = await supabase.rpc('get_admin_metrics')
        if (metricsError) throw metricsError

        const { data: supplyDemand, error: sdError } = await supabase.rpc('blood_supply_demand')
        if (sdError) throw sdError

        const { data: emergencies, error: emergenciesError } = await supabase.rpc('active_emergency_requests')
        if (emergenciesError) throw emergenciesError

        const { data: orgActivity, error: orgActivityError } = await supabase.rpc('organization_activity')
        if (orgActivityError) throw orgActivityError

        return NextResponse.json({
            metrics,
            supplyDemand,
            emergencies,
            organizationActivity: orgActivity
        })
    } catch (error) {
        console.error("Admin metrics error:", error)
        return NextResponse.json({ error: "Failed to fetch admin metrics" }, { status: 500 })
    }
}
