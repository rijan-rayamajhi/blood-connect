import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single()

        const orgId = profile?.organization_id

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q = (supabase as any).from('notifications')
            .update({ status: 'read' })
            .eq('status', 'unread')

        if (orgId) {
            q = q.or(`user_id.eq.${user.id},organization_id.eq.${orgId}`)
        } else {
            q = q.eq('user_id', user.id)
        }

        const { error } = await q

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
