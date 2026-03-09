import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsonToCsv } from '@/lib/utils/csv'

export async function GET(request: Request) {
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
            .single<{ organization_id: string | null, role: string }>()

        if (!profile) {
            return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
        }

        const { searchParams } = new URL(request.url)
        const defaultStart = new Date()
        defaultStart.setMonth(defaultStart.getMonth() - 1)

        const startDate = searchParams.get('start_date') || defaultStart.toISOString().split('T')[0]
        const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0]
        const format = searchParams.get('format')

        const orgIdParam = searchParams.get('organization_id')
        const targetOrgId = profile.role === 'admin' && orgIdParam ? orgIdParam : (profile.role === 'admin' ? null : profile.organization_id)

        // @ts-expect-error: RPC types might not be regenerated yet
        const { data, error } = await supabase.rpc('requests_report', {
            start_date: startDate,
            end_date: endDate,
            p_organization_id: targetOrgId
        })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        if (format === 'csv') {
            const csv = jsonToCsv(data || [])
            return new NextResponse(csv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="requests_report_${startDate}_to_${endDate}.csv"`,
                },
            })
        }

        return NextResponse.json({ success: true, data })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
