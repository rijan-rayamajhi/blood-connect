import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string, action: string }> }
) {
    try {
        const { id, action } = await params

        if (!['approve', 'reject', 'suspend'].includes(action)) {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
        }

        let remarks = ''
        if (action === 'reject') {
            const body = await request.json()
            remarks = body.remarks
            if (!remarks) {
                return NextResponse.json({ success: false, error: 'Remarks are required for rejection' }, { status: 400 })
            }
        }

        const supabase = await createClient()

        // Get the current user to log the audit event
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        // We use the admin client to bypass RLS for updating the org if needed, 
        // though the admin should already have permission via RLS. Let's use the standard client 
        // to ensure RLS policies are enforced (i.e. only admins can update).

        const updateData: Record<string, string | null> = {
            reviewed_at: new Date().toISOString()
        }

        if (action === 'approve') {
            updateData.status = 'approved'
        } else if (action === 'reject') {
            updateData.status = 'rejected'
            updateData.review_remarks = remarks
        } else if (action === 'suspend') {
            updateData.status = 'suspended'
        }

        const { error: updateError } = await (supabase
            .from('organizations') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
            .update(updateData)
            .eq('id', id)

        if (updateError) {
            console.error('Update Org Error:', updateError)
            return NextResponse.json({ success: false, error: 'Failed to update organization status' }, { status: 500 })
        }

        // Insert audit log
        const actionMap: Record<string, string> = {
            'approve': 'APPROVE_ORGANIZATION',
            'reject': 'REJECT_ORGANIZATION',
            'suspend': 'SUSPEND_ORGANIZATION'
        }

        // Using service role to insert audit log if needed, or simply let the authenticated user do it.
        // The authenticated_insert_audit_events policy allows any auth user.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('audit_events') as any).insert({
            actor_id: user.id,
            actor_role: 'admin',
            action: actionMap[action],
            target_id: id,
            metadata: { remarks }
        })

        return NextResponse.json({ success: true })

    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
