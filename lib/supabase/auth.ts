import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/supabase'

// ── Types ────────────────────────────────────────────────────────────────────

export interface AuthProfile {
    id: string
    email: string
    name: string
    role: UserRole
    organizationId: string | null
    staffRole?: 'Admin' | 'Inventory Manager' | 'Request Handler' | 'Viewer'
}

export interface SignUpInput {
    email: string
    password: string
    orgName: string
    role: 'hospital' | 'blood-bank'
}

export interface AuthResult {
    success: boolean
    profile?: AuthProfile
    error?: string
}

// DB row shapes for typed queries
interface OrgRow {
    id: string
    status: string
}

interface ProfileRow {
    id: string
    organization_id: string | null
    name: string
    email: string
    role: UserRole
}

interface AuditInsert {
    actor_role: string
    action: string
    target_id: string
    metadata: Record<string, string>
}

type SupabaseClient = ReturnType<typeof createClient>

// ── Sign Up ──────────────────────────────────────────────────────────────────
//
// Flow:
//   1. supabase.auth.signUp() → creates auth.users row
//   2. DB trigger 'on_auth_user_created' → auto-creates organizations + profiles
//   3. This function only needs to call signUp and report success/failure
//
// Edge cases handled:
//   - Email confirmation ON: user is created but not logged in → return success
//   - Email confirmation OFF: user is created and logged in → return success
//   - Admin role blocked at application level
//

export async function signUp(input: SignUpInput): Promise<AuthResult> {
    const { email, password, orgName, role } = input

    // Block admin signup from public form
    if ((role as string) === 'admin') {
        return { success: false, error: 'Admin accounts cannot be created through public signup.' }
    }

    const supabase = createClient()

    // Create auth user. We pass name + role in metadata so the DB trigger
    // (handle_new_user) can read them to create org + profile rows.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name: orgName, role }
        }
    })

    if (authError) {
        return { success: false, error: authError.message }
    }

    if (!authData.user) {
        return { success: false, error: 'Failed to create user account.' }
    }

    // Organization + Profile are created by the DB trigger.
    // We intentionally do NOT try to fetch them here because:
    // 1. If email confirmation is enabled, the user has no session yet
    // 2. The trigger runs synchronously in the DB, so rows exist by now
    return { success: true }
}

// ── Sign In ──────────────────────────────────────────────────────────────────
//
// Flow:
//   1. supabase.auth.signInWithPassword() → returns session
//   2. Fetch profile using the authenticated session
//   3. If profile missing (orphaned auth user), auto-repair from user metadata
//   4. Check organization status (pending/rejected/suspended blocks login)
//

export async function signIn(email: string, password: string): Promise<AuthResult> {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        await logAuditEvent(supabase, 'LOGIN_FAILED', email)
        return { success: false, error: error.message }
    }

    if (!data.user || !data.session) {
        return { success: false, error: 'Login failed. No session returned.' }
    }

    // Fetch profile — use maybeSingle() so missing row returns null, not an error
    let profile = await fetchProfile(supabase, data.user.id)

    // Auto-repair: If profile is missing (orphaned auth user from before
    // the trigger was installed), create it now from user metadata.
    if (!profile) {
        profile = await repairMissingProfile(supabase, data.user)
    }

    if (!profile) {
        // Even auto-repair failed — this is a real problem
        await supabase.auth.signOut()
        return { success: false, error: 'Unable to load your profile. Please contact support.' }
    }

    // Check organization status for non-admins
    if (profile.role !== 'admin' && profile.organizationId) {
        const orgCheck = await checkOrgStatus(supabase, profile.organizationId)
        if (orgCheck) {
            await supabase.auth.signOut()
            return { success: false, error: orgCheck }
        }
    }

    return { success: true, profile }
}

// ── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
    const supabase = createClient()
    await supabase.auth.signOut()
}

// ── Get Session + Profile ────────────────────────────────────────────────────
//
// Called on app load (AuthGate) to restore a persisted session.
//

export async function getSessionAndProfile(): Promise<AuthResult> {
    const supabase = createClient()

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
        return { success: false }
    }

    let profile = await fetchProfile(supabase, session.user.id)

    // Auto-repair for session restore too
    if (!profile) {
        profile = await repairMissingProfile(supabase, session.user)
    }

    if (!profile) {
        return { success: false, error: 'Profile not found.' }
    }

    // Check organization status for non-admins to terminate active session if suspended
    if (profile.role !== 'admin' && profile.organizationId) {
        const orgCheck = await checkOrgStatus(supabase, profile.organizationId)
        if (orgCheck) {
            await supabase.auth.signOut()
            return { success: false, error: orgCheck }
        }
    }

    return { success: true, profile }
}

// ── Core Helpers ─────────────────────────────────────────────────────────────

/**
 * Fetch profile using maybeSingle() to avoid PGRST116 errors on 0 rows.
 * Returns null if no profile exists (instead of throwing).
 */
async function fetchProfile(supabase: SupabaseClient, userId: string): Promise<AuthProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, organization_id, name, email, role')
        .eq('id', userId)
        .maybeSingle<ProfileRow>()

    if (error) {
        console.error('[Auth] fetchProfile error:', JSON.stringify(error))
        return null
    }

    if (!data) return null

    let staffRole: AuthProfile['staffRole'] | undefined = undefined

    if (data.role === 'blood-bank' && data.organization_id) {
        const { data: staff } = await supabase
            .from('staff')
            .select('role')
            .eq('email', data.email)
            .eq('organization_id', data.organization_id)
            .maybeSingle<{ role: string }>()

        if (staff) {
            staffRole = staff.role as AuthProfile['staffRole']
        }
    }

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        organizationId: data.organization_id,
        staffRole
    }
}

/**
 * Auto-repair: Creates a profile (and org if needed) for an auth user
 * that exists but has no profile row. This handles users created before
 * the DB trigger was installed, or if the trigger failed silently.
 *
 * Uses the user's raw_user_meta_data to determine role and org name.
 */
async function repairMissingProfile(
    supabase: SupabaseClient,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: { id: string; email?: string; user_metadata?: Record<string, any> }
): Promise<AuthProfile | null> {
    const meta = user.user_metadata || {}
    const role = (meta.role as UserRole) || 'hospital'
    const name = (meta.name as string) || 'Organization'
    const email = user.email || ''

    console.warn('[Auth] Auto-repairing missing profile for user:', user.id)

    try {
        let orgId: string | null = null

        // Create org for non-admin users
        if (role !== 'admin') {
            const { data: org, error: orgErr } = await supabase
                .from('organizations')
                .insert({ name, type: role, email, status: 'pending' } as never)
                .select('id')
                .single<OrgRow>()

            if (orgErr || !org) {
                console.error('[Auth] repairMissingProfile: org insert failed:', JSON.stringify(orgErr))
                return null
            }
            orgId = org.id
        }

        // Create the profile
        const { error: profErr } = await supabase
            .from('profiles')
            .insert({ id: user.id, organization_id: orgId, name, email, role } as never)

        if (profErr) {
            console.error('[Auth] repairMissingProfile: profile insert failed:', JSON.stringify(profErr))
            return null
        }

        return { id: user.id, email, name, role, organizationId: orgId }
    } catch (e) {
        console.error('[Auth] repairMissingProfile: unexpected error:', e)
        return null
    }
}

/**
 * Check organization status. Returns an error message string if the org
 * status blocks login, or null if login is allowed.
 */
async function checkOrgStatus(supabase: SupabaseClient, orgId: string): Promise<string | null> {
    const { data: org } = await supabase
        .from('organizations')
        .select('status')
        .eq('id', orgId)
        .maybeSingle<OrgRow>()

    if (!org) return null // Org not found — allow login (admin might have deleted it)

    switch (org.status) {
        case 'pending':
            return 'Your registration is pending approval. Please wait for the administrator to verify your account.'
        case 'rejected':
            return 'Your registration was rejected. Please contact the administrator.'
        case 'suspended':
            return 'Your account has been suspended. Please contact the administrator.'
        default:
            return null // 'approved' or any other status → allow
    }
}

/**
 * Non-blocking audit event logging. Failures are swallowed.
 */
async function logAuditEvent(supabase: SupabaseClient, action: string, targetId: string): Promise<void> {
    try {
        const payload: AuditInsert = {
            actor_role: 'anonymous',
            action,
            target_id: targetId,
            metadata: { timestamp: new Date().toISOString() },
        }
        await supabase.from('audit_events').insert(payload as never)
    } catch {
        console.warn('[Auth] Failed to log audit event')
    }
}
