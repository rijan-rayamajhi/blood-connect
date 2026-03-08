import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const actorRole = searchParams.get('actor_role')
        const targetId = searchParams.get('target_id')

        let query = supabase
            .from('audit_events')
            .select(`
                *,
                actor:profiles!actor_id (
                    name, email, role
                )
            `)
            .order('created_at', { ascending: false })
            .limit(100)

        if (action) {
            query = query.eq('action', action)
        }
        if (actorRole) {
            query = query.eq('actor_role', actorRole)
        }
        if (targetId) {
            query = query.eq('target_id', targetId)
        }

        const { data, error } = await query

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error("Audit logs error:", error)
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
    }
}
