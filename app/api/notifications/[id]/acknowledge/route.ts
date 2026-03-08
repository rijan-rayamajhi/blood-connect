import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await context.params

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('notifications')
            .update({
                status: 'acknowledged',
                acknowledged_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('priority', 'critical')

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
