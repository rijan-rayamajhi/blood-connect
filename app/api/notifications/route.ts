import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch notifications handled by RLS (user_read_notifications policy)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query = (supabase as any)
            .from('notifications')
            .select('*')

        // Support optional filters
        const url = new URL(request.url)
        const statusStr = url.searchParams.get('status')
        const priorityStr = url.searchParams.get('priority')

        if (statusStr) {
            query = query.eq('status', statusStr)
        }
        if (priorityStr) {
            query = query.eq('priority', priorityStr)
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(100)

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        // Map to frontend interface AppNotification
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const notifications = (data || []).map((row: any) => ({
            id: row.id,
            title: row.title,
            message: row.message,
            priority: row.priority,
            createdAt: new Date(row.created_at).getTime(),
            status: row.status,
            metadata: row.metadata
        }))

        return NextResponse.json({ success: true, data: notifications })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE() {
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

        // Delete user's own notifications or organization notifications
        const orgId = profile?.organization_id

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q = (supabase as any).from('notifications').delete()
        if (orgId) {
            q = q.or(`recipient_user_id.eq.${user.id},organization_id.eq.${orgId}`)
        } else {
            q = q.eq('recipient_user_id', user.id)
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
