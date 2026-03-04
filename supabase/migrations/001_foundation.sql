-- ============================================================================
-- BloodConnect Foundation Migration
-- Creates: organizations, profiles, audit_events, system_config, master_data
-- Includes: RLS policies, indexes, seed data, triggers
-- ============================================================================

-- ── 1. Tables ────────────────────────────────────────────────────────────────

-- Organizations (hospitals and blood banks)
CREATE TABLE IF NOT EXISTS public.organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('hospital', 'blood-bank')),
    email       TEXT NOT NULL UNIQUE,
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION,
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    documents   JSONB DEFAULT '{}'::jsonb,
    review_remarks TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    email           TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('admin', 'hospital', 'blood-bank')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Events (immutable log)
CREATE TABLE IF NOT EXISTS public.audit_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role  TEXT NOT NULL,
    action      TEXT NOT NULL,
    target_id   TEXT,
    metadata    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Configuration (singleton row)
CREATE TABLE IF NOT EXISTS public.system_config (
    id                              INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    sla_response_minutes            INT NOT NULL DEFAULT 5,
    emergency_escalation_minutes    INT NOT NULL DEFAULT 5,
    stuck_request_threshold_minutes INT NOT NULL DEFAULT 10,
    low_stock_threshold             INT NOT NULL DEFAULT 10,
    near_expiry_hours               INT NOT NULL DEFAULT 48,
    announcement_message            TEXT,
    announcement_priority           TEXT CHECK (
        announcement_priority IS NULL OR
        announcement_priority IN ('normal', 'moderate', 'critical')
    ),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Master Data (singleton row)
CREATE TABLE IF NOT EXISTS public.master_data (
    id                  INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    blood_groups        JSONB NOT NULL DEFAULT '[]'::jsonb,
    component_types     JSONB NOT NULL DEFAULT '[]'::jsonb,
    urgency_levels      JSONB NOT NULL DEFAULT '[]'::jsonb,
    notification_rules  JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Triggers: auto-update updated_at ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_system_config_updated_at
    BEFORE UPDATE ON public.system_config
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_master_data_updated_at
    BEFORE UPDATE ON public.master_data
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 3. Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_organizations_type
    ON public.organizations(type);

CREATE INDEX IF NOT EXISTS idx_organizations_status
    ON public.organizations(status);

CREATE INDEX IF NOT EXISTS idx_profiles_organization_id
    ON public.profiles(organization_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id
    ON public.audit_events(actor_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at
    ON public.audit_events(created_at DESC);

-- ── 4. Row Level Security ────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.organizations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_data    ENABLE ROW LEVEL SECURITY;

-- ── Organizations ──

-- Admins can see all organizations
CREATE POLICY "admin_read_all_organizations"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Users can see their own organization
CREATE POLICY "user_read_own_organization"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM public.profiles
            WHERE profiles.id = auth.uid()
        )
    );

-- Admins can insert organizations (registration approval creates them)
CREATE POLICY "admin_insert_organizations"
    ON public.organizations FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Anyone can insert an organization during registration (before having a profile)
CREATE POLICY "anon_insert_organizations"
    ON public.organizations FOR INSERT
    TO anon
    WITH CHECK (status = 'pending');

-- Admins can update any organization (approve, reject, suspend)
CREATE POLICY "admin_update_organizations"
    ON public.organizations FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ── Profiles ──

-- Users can read their own profile
CREATE POLICY "user_read_own_profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "admin_read_all_profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Users can update their own profile
CREATE POLICY "user_update_own_profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Allow profile creation during signup (via trigger or direct insert)
CREATE POLICY "user_insert_own_profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- ── Audit Events ──

-- Only admins can read audit events
CREATE POLICY "admin_read_audit_events"
    ON public.audit_events FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Any authenticated user can insert audit events (server-side logging)
CREATE POLICY "authenticated_insert_audit_events"
    ON public.audit_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ── System Config ──

-- All authenticated users can read system config
CREATE POLICY "authenticated_read_system_config"
    ON public.system_config FOR SELECT
    TO authenticated
    USING (true);

-- Allow anonymous read for system config (needed before login for SLA display)
CREATE POLICY "anon_read_system_config"
    ON public.system_config FOR SELECT
    TO anon
    USING (true);

-- Only admins can update system config
CREATE POLICY "admin_update_system_config"
    ON public.system_config FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ── Master Data ──

-- All authenticated users can read master data
CREATE POLICY "authenticated_read_master_data"
    ON public.master_data FOR SELECT
    TO authenticated
    USING (true);

-- Allow anonymous read for master data (needed in registration form for blood groups)
CREATE POLICY "anon_read_master_data"
    ON public.master_data FOR SELECT
    TO anon
    USING (true);

-- Only admins can update master data
CREATE POLICY "admin_update_master_data"
    ON public.master_data FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ── 5. Seed Data ─────────────────────────────────────────────────────────────

-- System Config defaults (matching frontend DEFAULT_CONFIG)
INSERT INTO public.system_config (
    id,
    sla_response_minutes,
    emergency_escalation_minutes,
    stuck_request_threshold_minutes,
    low_stock_threshold,
    near_expiry_hours,
    announcement_message,
    announcement_priority
) VALUES (
    1, 5, 5, 10, 10, 48, NULL, NULL
) ON CONFLICT (id) DO NOTHING;

-- Master Data defaults (matching frontend master-data-store seeds)
INSERT INTO public.master_data (
    id,
    blood_groups,
    component_types,
    urgency_levels,
    notification_rules
) VALUES (
    1,
    '["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]'::jsonb,
    '["Whole Blood", "Packed RBC", "Platelets", "Plasma", "Cryoprecipitate"]'::jsonb,
    '[
        {"label": "Critical", "slaMinutes": 30, "escalationMinutes": 15},
        {"label": "Moderate", "slaMinutes": 120, "escalationMinutes": 60},
        {"label": "Normal", "slaMinutes": 480, "escalationMinutes": 240}
    ]'::jsonb,
    '[
        {"priority": "critical", "soundEnabled": true, "autoDismissSeconds": null},
        {"priority": "moderate", "soundEnabled": true, "autoDismissSeconds": 10},
        {"priority": "normal", "soundEnabled": false, "autoDismissSeconds": 5}
    ]'::jsonb
) ON CONFLICT (id) DO NOTHING;
