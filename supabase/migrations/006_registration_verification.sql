-- ============================================================================
-- BloodConnect Migration: Registration Verification
-- Adds: submitted_at to organizations
-- Updates: RLS for faster verification
-- ============================================================================

-- Add new column
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Drop existing organizations policies to replace them with faster versions
DROP POLICY IF EXISTS "admin_read_all_organizations" ON public.organizations;
DROP POLICY IF EXISTS "user_read_own_organization" ON public.organizations;
DROP POLICY IF EXISTS "admin_insert_organizations" ON public.organizations;
DROP POLICY IF EXISTS "admin_update_organizations" ON public.organizations;

-- Admins can see all organizations (using JWT roles for faster evaluation)
CREATE POLICY "admin_read_all_organizations"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (
        auth.jwt()->>'role' = 'admin'
    );

-- Users can see their own organization (using JWT claims)
CREATE POLICY "user_read_own_organization"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (
        id::text = auth.jwt()->>'organization_id'
        OR 
        id IN (
            SELECT organization_id FROM public.profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- Admins can insert organizations
CREATE POLICY "admin_insert_organizations"
    ON public.organizations FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.jwt()->>'role' = 'admin'
    );

-- Admins can update any organization
CREATE POLICY "admin_update_organizations"
    ON public.organizations FOR UPDATE
    TO authenticated
    USING (
        auth.jwt()->>'role' = 'admin'
    )
    WITH CHECK (
        auth.jwt()->>'role' = 'admin'
    );
