-- ============================================================================
-- BloodConnect Staff Management System
-- Creates: staff
-- ============================================================================

-- 1. Create Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Inventory Manager', 'Request Handler', 'Viewer')),
    status TEXT NOT NULL CHECK (status IN ('Active', 'Offline')) DEFAULT 'Offline',
    last_active TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint on email per organization (or globally depending on business logic, but typical staff are per-org)
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_email_org
    ON public.staff(email, organization_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_organization_id
    ON public.staff(organization_id);

CREATE INDEX IF NOT EXISTS idx_staff_status
    ON public.staff(status);

-- 2. Trigger for updated_at
CREATE TRIGGER set_staff_updated_at
    BEFORE UPDATE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Staff members can access rows where: organization_id = their own organization_id
-- We look up the organization_id from the profile of the current user.
CREATE POLICY "staff_read_own_organization"
    ON public.staff FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
    );

-- Admins can view all staff
CREATE POLICY "admin_read_all_staff"
    ON public.staff FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Staff with Admin role in the organization can insert/update/delete staff in their organization
CREATE POLICY "admin_insert_own_organization"
    ON public.staff FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
        AND EXISTS (
             SELECT 1 FROM public.staff s
                WHERE s.email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
                AND s.organization_id = organization_id
                AND s.role = 'Admin'
        )
    );

CREATE POLICY "admin_update_own_organization"
    ON public.staff FOR UPDATE
    TO authenticated
    USING (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
         AND EXISTS (
             SELECT 1 FROM public.staff s
                WHERE s.email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
                AND s.organization_id = organization_id
                AND s.role = 'Admin'
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "admin_delete_own_organization"
    ON public.staff FOR DELETE
    TO authenticated
    USING (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p WHERE p.id = auth.uid()
        )
         AND EXISTS (
             SELECT 1 FROM public.staff s
                WHERE s.email = (SELECT email FROM auth.users WHERE id = auth.uid()) 
                AND s.organization_id = organization_id
                AND s.role = 'Admin'
        )
    );

-- System Admins can manage all staff
CREATE POLICY "sys_admin_manage_all_staff"
    ON public.staff FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- 4. Create trigger to auto-update last_active based on recent activity (or can be done manually via API)
CREATE OR REPLACE FUNCTION public.update_staff_last_active()
RETURNS TRIGGER AS $$
BEGIN
    -- Update staff matching the user's email since `staff` depends on email
    UPDATE public.staff
    SET last_active = now(),
        status = 'Active'
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For instance, whenever they generate an audit event, update their last active
CREATE TRIGGER set_staff_last_active
    AFTER INSERT ON public.audit_events
    FOR EACH ROW EXECUTE FUNCTION public.update_staff_last_active();

-- Allow any authenticated user to update their own staff status to offline/active
CREATE POLICY "update_own_status"
    ON public.staff FOR UPDATE
    TO authenticated
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
