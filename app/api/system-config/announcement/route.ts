import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // Verify admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((profile as any)?.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { message, priority = 'normal' } = body

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
        }

        // To broadcast to all organizations, we can either insert a notification for each organization,
        // or support a system-wide broadcast. The requirements state: 
        // "Insert notifications for: all organizations. Use metadata: type: 'announcement'"

        // Get all organizations
        const { data: organizations, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .eq('status', 'approved')

        if (orgError) {
            throw orgError
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const notifications = (organizations || []).map((org: any) => ({
            organization_id: org.id,
            title: 'System Announcement',
            message: message,
            priority: priority,
            metadata: { type: 'announcement' }
        }))

        if (notifications.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: insertError } = await (supabase as any)
                .from('notifications')
                .insert(notifications)

            if (insertError) {
                throw insertError
            }
        }

        return NextResponse.json({ success: true, message: 'Broadcast sent successfully' })

    } catch (error: unknown) {
        console.error('Error broadcasting announcement:', error)
        const errorMessage = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
}
