import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

type StaffUpdate = Database['public']['Tables']['staff']['Update']

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = (await createClient()) as any

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await request.json()
        const { name, email, phone, role, status, last_active } = body

        // Build the update object dynamically
        const updateData: StaffUpdate = {}
        if (name) updateData.name = name
        if (email) updateData.email = email
        if (phone !== undefined) updateData.phone = phone
        if (role) updateData.role = role
        if (status) updateData.status = status
        if (last_active) updateData.last_active = last_active

        const { data: updatedStaff, error } = await (supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('staff' as any)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update(updateData as any)
            .eq('id', id)
            .select()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .single() as any)

        if (error) {
            console.error('Error updating staff:', error)
            return new NextResponse('Internal Server Error', { status: 500 })
        }

        return NextResponse.json(updatedStaff)
    } catch (error) {
        console.error('Error in PATCH /api/staff/[id]:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = (await createClient()) as any

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { error } = await supabase
            .from('staff')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting staff:', error)
            return new NextResponse('Internal Server Error', { status: 500 })
        }

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error in DELETE /api/staff/[id]:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
