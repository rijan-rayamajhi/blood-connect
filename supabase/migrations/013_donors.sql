-- ============================================================================
-- Donor Management System Migration
-- ============================================================================

-- 1. Create donors table
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    age INT NOT NULL,
    contact_number TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Ineligible', 'Temporary Deferral')),
    last_donation_date DATE NULL,
    total_donations INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donors_organization_id ON public.donors(organization_id);
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON public.donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_donors_status ON public.donors(status);

-- 2. Create donor_donations table
CREATE TABLE IF NOT EXISTS public.donor_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
    donation_date DATE NOT NULL,
    blood_group TEXT NOT NULL,
    component_type TEXT NOT NULL,
    quantity INT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donor_donations_donor_id ON public.donor_donations(donor_id);

-- 3. Extend notifications table for donor_id
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS donor_id UUID NULL REFERENCES public.donors(id) ON DELETE CASCADE;

-- 4. Enable RLS
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_donations ENABLE ROW LEVEL SECURITY;

-- Policies for donors
-- Admins: all
CREATE POLICY "admin_all_donors" ON public.donors FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Blood banks: manage own donors
CREATE POLICY "blood_bank_select_donors" ON public.donors FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank'));

CREATE POLICY "blood_bank_insert_donors" ON public.donors FOR INSERT TO authenticated
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank'));

CREATE POLICY "blood_bank_update_donors" ON public.donors FOR UPDATE TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank'))
WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank'));

CREATE POLICY "blood_bank_delete_donors" ON public.donors FOR DELETE TO authenticated
USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank'));

-- Policies for donor_donations
-- Admins: all
CREATE POLICY "admin_all_donor_donations" ON public.donor_donations FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Blood banks: manage donations for their donors
CREATE POLICY "blood_bank_select_donor_donations" ON public.donor_donations FOR SELECT TO authenticated
USING (donor_id IN (SELECT id FROM public.donors WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank')));

CREATE POLICY "blood_bank_insert_donor_donations" ON public.donor_donations FOR INSERT TO authenticated
WITH CHECK (donor_id IN (SELECT id FROM public.donors WHERE organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND role = 'blood-bank')));

-- 5. Eligibility Logic Trigger
CREATE OR REPLACE FUNCTION public.check_donor_eligibility()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is manually set to Ineligible, keep it
    IF NEW.status = 'Ineligible' THEN
        RETURN NEW;
    END IF;

    IF NEW.last_donation_date IS NOT NULL AND NEW.last_donation_date >= (CURRENT_DATE - INTERVAL '90 days') THEN
        NEW.status := 'Temporary Deferral';
    ELSE
        NEW.status := 'Available';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_donor_eligibility
    BEFORE INSERT OR UPDATE ON public.donors
    FOR EACH ROW EXECUTE FUNCTION public.check_donor_eligibility();

-- Auto update updated_at for donors
CREATE TRIGGER set_donors_updated_at
    BEFORE UPDATE ON public.donors
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Emergency Donor Recall Trigger
CREATE OR REPLACE FUNCTION public.notify_eligible_donors_on_emergency()
RETURNS TRIGGER AS $$
DECLARE
    d RECORD;
    hosp_name TEXT;
BEGIN
    IF NEW.is_emergency = TRUE THEN
        SELECT name INTO hosp_name FROM public.organizations WHERE id = NEW.hospital_id;
        
        -- Find eligible donors with matching blood group
        FOR d IN SELECT id, organization_id FROM public.donors WHERE blood_group = NEW.blood_group AND status = 'Available' LOOP
            INSERT INTO public.notifications (organization_id, donor_id, title, message, priority, metadata)
            VALUES (
                d.organization_id,
                d.id,
                'Emergency Donor Recall',
                'Urgent requirement for ' || NEW.blood_group || ' blood at ' || hosp_name || '. Please donate if you can.',
                'moderate',
                jsonb_build_object('type', 'donor_recall', 'request_id', NEW.id)
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_eligible_donors
    AFTER INSERT ON public.requests
    FOR EACH ROW EXECUTE FUNCTION public.notify_eligible_donors_on_emergency();

-- 7. Realtime Donor Updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.donors;
