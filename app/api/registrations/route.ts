import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()

        const orgName = formData.get('orgName') as string
        const role = formData.get('role') as 'hospital' | 'blood-bank'
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const licenseFile = formData.get('licenseFile') as File | null
        const certificationFile = formData.get('certificationFile') as File | null

        if (!orgName || !role || !email || !password || !licenseFile) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // We use admin client because RLS might prevent unauthenticated users from uploading to specific folders securely without complex policies.
        // Wait, the migration 002 says "authenticated users can upload". Since the user is registering, they are NOT authenticated yet.
        // Thus, we must use the Service Role key to upload the documents on their behalf before they are created,
        // OR create the user first, then upload the documents.
        // If we create the user first, the trigger creates the organization immediately.
        // Then we can upload the documents and update the organization row.

        // Let's create the user using the normal client
        const supabase = await createClient()

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: orgName, role }
            }
        })

        if (authError || !authData.user) {
            return NextResponse.json(
                { success: false, error: authError?.message || 'Failed to create user account' },
                { status: 400 }
            )
        }

        const userId = authData.user.id

        // Wait briefly for the DB trigger to finish, or fetch the user's profile to get the organization_id
        // (Supabase triggers run synchronously with the insert, so it should be available immediately)
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', userId)
            .single<{ organization_id: string }>()

        if (profileError || !profileData?.organization_id) {
            return NextResponse.json(
                { success: false, error: 'Profile creation delayed or failed. Please contact support.' },
                { status: 500 }
            )
        }

        const orgId = profileData.organization_id

        // Use the admin client to upload files since the current session might not have permission yet (email confirmation might be required)
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Upload documents
        const timestamp = Date.now()
        let licenseUrl = ''
        let certificationUrl = ''

        const licensePath = `${orgId}/license_${timestamp}_${licenseFile.name}`
        const { error: licenseUploadError } = await supabaseAdmin.storage
            .from('org-documents')
            .upload(licensePath, licenseFile)

        if (licenseUploadError) {
            return NextResponse.json({ success: false, error: 'Failed to upload license document' }, { status: 500 })
        }

        const { data: licensePublicUrl } = supabaseAdmin.storage.from('org-documents').getPublicUrl(licensePath)
        licenseUrl = licensePublicUrl.publicUrl

        if (certificationFile) {
            const certPath = `${orgId}/certification_${timestamp}_${certificationFile.name}`
            const { error: certUploadError } = await supabaseAdmin.storage
                .from('org-documents')
                .upload(certPath, certificationFile)

            if (!certUploadError) {
                const { data: certPublicUrl } = supabaseAdmin.storage.from('org-documents').getPublicUrl(certPath)
                certificationUrl = certPublicUrl.publicUrl
            }
        }

        const documents = {
            licenseUrl,
            certificationUrl: certificationUrl || undefined
        }

        // Update the organization with the documents and submitted_at
        const { error: updateError } = await supabaseAdmin
            .from('organizations')
            .update({
                documents,
                submitted_at: new Date().toISOString()
            })
            .eq('id', orgId)

        if (updateError) {
            return NextResponse.json({ success: false, error: 'Failed to link documents to organization' }, { status: 500 })
        }

        return NextResponse.json({ success: true, organizationId: orgId })

    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal server error during registration' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const supabase = await createClient()

    let query = supabase.from('organizations').select('*').order('created_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await query.returns<any[]>()

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Map db camel_case / snake_case back to frontend expected structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registrations = (data as any[]).map(org => ({
        id: org.id,
        name: org.name,
        type: org.type,
        email: org.email,
        status: org.status,
        documents: org.documents,
        submittedAt: new Date(org.submitted_at || org.created_at).getTime(),
        reviewedAt: org.reviewed_at ? new Date(org.reviewed_at).getTime() : undefined,
        reviewRemarks: org.review_remarks
    }))

    return NextResponse.json({ success: true, data: registrations })
}
