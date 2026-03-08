import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Database } from '@/types/supabase'

export async function GET(request: Request) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = (await createClient()) as any

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Get URL parameters
        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')
        const status = searchParams.get('status')
        const organization_id = searchParams.get('organization_id')

        // Build query
        let query = supabase
            .from('staff')
            .select('*')
            .order('created_at', { ascending: false })

        // Apply filters if provided
        if (role && role !== 'All') {
            query = query.eq('role', role)
        }
        if (status) {
            query = query.eq('status', status)
        }
        if (organization_id) {
            query = query.eq('organization_id', organization_id)
        }

        const { data: staff, error } = await query

        if (error) {
            console.error('Error fetching staff:', error)
            return new NextResponse('Internal Server Error', { status: 500 })
        }

        return NextResponse.json(staff)
    } catch (error) {
        console.error('Error in GET /api/staff:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = (await createClient()) as any

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Get user's profile to retrieve organization_id implicitly
        const { data: profile } = await (supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', session.user.id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .single() as any)

        if (!profile?.organization_id) {
            return new NextResponse('Organization not found', { status: 400 })
        }

        const body = await request.json()
        const { name, email, phone, role } = body

        if (!name || !email || !role) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        // In a real system, you would also invite the user via Supabase Auth admin API here
        // so they can log in. For now we just create the staff record to manage them.

        const { data: newStaff, error } = await (supabase
            .from('staff')
            .insert({
                organization_id: profile.organization_id as string,
                name,
                email,
                phone,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                role: role as any,
                status: 'Offline', // Default status
                last_active: new Date().toISOString()
            })
            .select()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .single() as any)

        if (error) {
            console.error('Error creating staff:', error)
            return new NextResponse('Internal Server Error', { status: 500 })
        }

        return NextResponse.json(newStaff)
    } catch (error) {
        console.error('Error in POST /api/staff:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
