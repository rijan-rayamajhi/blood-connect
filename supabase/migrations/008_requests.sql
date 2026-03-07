-- ============================================================================
-- BloodConnect Requests Engine Migration
-- Creates: requests, request_timeline
-- Includes: RLS, Indexes, FSM Validation, Realtime
-- ============================================================================

-- ── 1. Requests Table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.requests (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id             UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    blood_bank_id           UUID NULL REFERENCES public.organizations(id) ON DELETE SET NULL,
    blood_group             TEXT NOT NULL,
    component_type          TEXT NOT NULL,
    quantity                INT NOT NULL CHECK (quantity > 0),
    urgency                 TEXT NOT NULL CHECK (urgency IN ('critical', 'moderate', 'normal')),
    required_date           DATE NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'sent'
                            CHECK (status IN ('sent', 'accepted', 'partially-accepted', 'rejected', 'cancelled', 'collected', 'escalated')),
    prescription_file_id    TEXT NULL,
    overridden              BOOLEAN NOT NULL DEFAULT FALSE,
    override_reason         TEXT NULL,
    overridden_at           TIMESTAMPTZ NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requests_hospital_id ON public.requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_requests_blood_bank_id ON public.requests(blood_bank_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_required_date ON public.requests(required_date);

-- ── 2. Request Timeline Table ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.request_timeline (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id  UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    status      TEXT NOT NULL,
    actor_id    UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_request_timeline_request_id ON public.request_timeline(request_id);

-- ── 3. Auto-update updated_at trigger ────────────────────────────────────────

CREATE TRIGGER set_requests_updated_at
    BEFORE UPDATE ON public.requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 4. Request Lifecycle FSM Validation ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.validate_request_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate if status is actually changing
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Allow all transitions if overridden by admin
    IF NEW.overridden = TRUE THEN
        RETURN NEW;
    END IF;

    -- Define allowed FSM transitions
    CASE OLD.status
        WHEN 'sent' THEN
            IF NEW.status NOT IN ('accepted', 'partially-accepted', 'rejected', 'cancelled', 'escalated') THEN
                RAISE EXCEPTION 'Invalid request status transition from % to %', OLD.status, NEW.status;
            END IF;
        WHEN 'accepted' THEN
            IF NEW.status NOT IN ('collected') THEN
                RAISE EXCEPTION 'Invalid request status transition from % to %', OLD.status, NEW.status;
            END IF;
        WHEN 'partially-accepted' THEN
            IF NEW.status NOT IN ('collected', 'cancelled') THEN
                RAISE EXCEPTION 'Invalid request status transition from % to %', OLD.status, NEW.status;
            END IF;
        WHEN 'escalated' THEN
            -- An escalated request can be picked up just like a sent one
            IF NEW.status NOT IN ('accepted', 'partially-accepted', 'rejected', 'cancelled') THEN
                RAISE EXCEPTION 'Invalid request status transition from % to %', OLD.status, NEW.status;
            END IF;
        WHEN 'rejected' THEN
            RAISE EXCEPTION 'Request is already rejected and cannot be changed';
        WHEN 'collected' THEN
            RAISE EXCEPTION 'Request is already collected and cannot be changed';
        WHEN 'cancelled' THEN
            RAISE EXCEPTION 'Request is already cancelled and cannot be changed';
        ELSE
            RAISE EXCEPTION 'Unknown request status: %', OLD.status;
    END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_request_transition
    BEFORE UPDATE ON public.requests
    FOR EACH ROW EXECUTE FUNCTION public.validate_request_transition();

-- ── 5. Auto-Timeline Trigger ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_timeline_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Create timeline entry if status changed or just inserted
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status != OLD.status) THEN
        INSERT INTO public.request_timeline (request_id, status, actor_id, timestamp)
        -- auth.uid() is the actor changing the state
        VALUES (NEW.id, NEW.status, auth.uid(), now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_timeline_entry
    AFTER INSERT OR UPDATE ON public.requests
    FOR EACH ROW EXECUTE FUNCTION public.create_timeline_entry();

-- ── 6. Row Level Security ────────────────────────────────────────────────────

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_timeline ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admin_all_requests"
    ON public.requests FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "admin_all_timeline"
    ON public.request_timeline FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Hospitals: CRUD on own requests
CREATE POLICY "hospital_select_requests"
    ON public.requests FOR SELECT TO authenticated
    USING (hospital_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'hospital'));

CREATE POLICY "hospital_insert_requests"
    ON public.requests FOR INSERT TO authenticated
    WITH CHECK (hospital_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'hospital'));

CREATE POLICY "hospital_update_requests"
    ON public.requests FOR UPDATE TO authenticated
    USING (hospital_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'hospital'))
    WITH CHECK (hospital_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'hospital'));

CREATE POLICY "hospital_select_timeline"
    ON public.request_timeline FOR SELECT TO authenticated
    USING (request_id IN (SELECT id FROM public.requests WHERE hospital_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'hospital')));

-- Blood Banks: Select and Update on assigned or all requests (broadcasting to available)
-- If blood_bank_id is NULL, any blood bank can see it? The user prompt states: 
-- "can view requests assigned to them" 
-- "can update status" 
-- An SOS could be broadcasted by leaving blood_bank_id NULL.
CREATE POLICY "blood_bank_select_requests"
    ON public.requests FOR SELECT TO authenticated
    USING (
        blood_bank_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank')
        OR blood_bank_id IS NULL
    );

CREATE POLICY "blood_bank_update_requests"
    ON public.requests FOR UPDATE TO authenticated
    USING (
        blood_bank_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank')
        OR blood_bank_id IS NULL
    )
    WITH CHECK (
        blood_bank_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank')
        OR blood_bank_id IS NULL
    );

CREATE POLICY "blood_bank_select_timeline"
    ON public.request_timeline FOR SELECT TO authenticated
    USING (
        request_id IN (
            SELECT id FROM public.requests WHERE blood_bank_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank')
            OR blood_bank_id IS NULL
        )
    );

-- ── 7. Enable Realtime ──────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_timeline;
