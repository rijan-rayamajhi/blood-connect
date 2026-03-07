import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await (supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .single() as any)

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
        }

        const { data: updatedData, error: updateError } = await (supabase
            .from('requests')
            .update({
                status: 'escalated'
            } as never)
            .eq('id', id)
            .select()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .single() as any)

        if (updateError) {
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: updatedData })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
