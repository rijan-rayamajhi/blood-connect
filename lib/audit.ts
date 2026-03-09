import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key to bypass RLS for logging events reliably
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function logAuditEvent({
    action,
    actorId,
    actorRole,
    targetId,
    metadata = {}
}: {
    action: string
    actorId?: string
    actorRole?: string
    targetId?: string
    metadata?: Record<string, unknown>
}) {
    try {
        await supabase.from('audit_events').insert({
            action,
            actor_id: actorId || null,
            actor_role: actorRole || 'system',
            target_id: targetId || null,
            metadata,
        })
    } catch (error) {
        console.error("Failed to insert audit event:", error)
    }
}
