-- ============================================================================
-- BloodConnect Inventory Migration
-- Creates: inventory table, indexes, RLS policies, expiry trigger, RPC functions
-- ============================================================================

-- ── 1. Table ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.inventory (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    blood_group             TEXT NOT NULL,
    component_type          TEXT NOT NULL,
    quantity                INT NOT NULL CHECK (quantity > 0),
    collection_date         DATE NOT NULL,
    expiry_date             DATE NOT NULL,
    status                  TEXT NOT NULL DEFAULT 'available'
                            CHECK (status IN ('available', 'reserved', 'expired', 'near-expiry')),
    reserved_for_request_id UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_inventory_organization_id
    ON public.inventory(organization_id);

CREATE INDEX IF NOT EXISTS idx_inventory_blood_group
    ON public.inventory(blood_group);

CREATE INDEX IF NOT EXISTS idx_inventory_status
    ON public.inventory(status);

CREATE INDEX IF NOT EXISTS idx_inventory_expiry_date
    ON public.inventory(expiry_date);

-- ── 3. Auto-update updated_at trigger ────────────────────────────────────────

CREATE TRIGGER set_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 4. Expiry Detection Trigger ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If reserved, keep reserved status regardless of expiry
    IF NEW.reserved_for_request_id IS NOT NULL THEN
        NEW.status := 'reserved';
        RETURN NEW;
    END IF;

    -- Check expiry
    IF NEW.expiry_date < CURRENT_DATE THEN
        NEW.status := 'expired';
    ELSIF NEW.expiry_date <= (CURRENT_DATE + interval '48 hours') THEN
        NEW.status := 'near-expiry';
    ELSE
        NEW.status := 'available';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_inventory_status
    BEFORE INSERT OR UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.update_inventory_status();

-- ── 5. Row Level Security ────────────────────────────────────────────────────

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Admins: full access to all inventory
CREATE POLICY "admin_all_inventory"
    ON public.inventory FOR ALL
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

-- Blood bank users: full CRUD on own organization's inventory
CREATE POLICY "blood_bank_select_own_inventory"
    ON public.inventory FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'blood-bank'
        )
    );

CREATE POLICY "blood_bank_insert_own_inventory"
    ON public.inventory FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'blood-bank'
        )
    );

CREATE POLICY "blood_bank_update_own_inventory"
    ON public.inventory FOR UPDATE
    TO authenticated
    USING (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'blood-bank'
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'blood-bank'
        )
    );

CREATE POLICY "blood_bank_delete_own_inventory"
    ON public.inventory FOR DELETE
    TO authenticated
    USING (
        organization_id IN (
            SELECT p.organization_id FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'blood-bank'
        )
    );

-- Hospitals: read-only access to all inventory (to search for available blood)
CREATE POLICY "hospital_read_inventory"
    ON public.inventory FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'hospital'
        )
    );

-- ── 6. RPC: Atomic Reservation (prevents double booking) ────────────────────

CREATE OR REPLACE FUNCTION public.reserve_inventory_unit(
    p_unit_id UUID,
    p_request_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_unit RECORD;
BEGIN
    -- Lock the row to prevent concurrent reservation
    SELECT id, status, reserved_for_request_id
    INTO v_unit
    FROM public.inventory
    WHERE id = p_unit_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Unit not found');
    END IF;

    IF v_unit.status != 'available' AND v_unit.status != 'near-expiry' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Unit is not available for reservation (current status: ' || v_unit.status || ')'
        );
    END IF;

    UPDATE public.inventory
    SET reserved_for_request_id = p_request_id,
        updated_at = now()
    WHERE id = p_unit_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 7. RPC: Release Reservation ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.release_inventory_unit(
    p_unit_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_unit RECORD;
BEGIN
    SELECT id, status, reserved_for_request_id
    INTO v_unit
    FROM public.inventory
    WHERE id = p_unit_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Unit not found');
    END IF;

    IF v_unit.reserved_for_request_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Unit is not currently reserved');
    END IF;

    UPDATE public.inventory
    SET reserved_for_request_id = NULL,
        updated_at = now()
    WHERE id = p_unit_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 8. Enable Realtime ──────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
