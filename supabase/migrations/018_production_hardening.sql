-- ============================================================================
-- Production Hardening (Jobs Reliability, DB Optimizations, Storage Security)
-- ============================================================================

-- ── 1. Background Jobs Reliability ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.job_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    error_message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update check_emergency_escalations to contain TRY/CATCH blocks per iteration
CREATE OR REPLACE FUNCTION public.check_emergency_escalations()
RETURNS void AS $$
DECLARE
    req RECORD;
BEGIN
    FOR req IN 
        SELECT id, hospital_id FROM public.requests 
        WHERE is_emergency = TRUE 
          AND escalated = FALSE 
          AND status IN ('sent', 'partially-accepted')
          AND now() > response_deadline
    LOOP
        BEGIN
            -- Update request
            UPDATE public.requests 
            SET escalated = TRUE, escalated_at = now(), status = 'escalated'
            WHERE id = req.id;

            -- Insert notification for admins
            INSERT INTO public.notifications (user_id, title, message, priority, metadata)
            SELECT id, 'Emergency Request Escalated', 'Request breached SLA and was escalated.', 'critical', jsonb_build_object('request_id', req.id)
            FROM public.profiles 
            WHERE role = 'admin';
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO public.job_failures (job_name, error_message, metadata)
            VALUES ('check_emergency_escalations', SQLERRM, jsonb_build_object('request_id', req.id));
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update check_upcoming_prebookings to handle errors smoothly
CREATE OR REPLACE FUNCTION public.check_upcoming_prebookings()
RETURNS void AS $$
DECLARE
    booking RECORD;
    bb_org  RECORD;
BEGIN
    FOR booking IN
        SELECT pb.id, pb.hospital_id, pb.blood_group, pb.component_type,
               pb.quantity, pb.scheduled_date
        FROM public.pre_bookings pb
        WHERE pb.status = 'scheduled'
          AND pb.scheduled_date BETWEEN now() AND (now() + INTERVAL '24 hours')
          AND NOT EXISTS (
              SELECT 1 FROM public.notifications n
              WHERE n.organization_id = pb.hospital_id
                AND n.metadata->>'type' = 'prebooking_reminder'
                AND n.metadata->>'booking_id' = pb.id::TEXT
                AND n.created_at > (now() - INTERVAL '1 hour')
          )
    LOOP
        BEGIN
            -- Notify the hospital
            INSERT INTO public.notifications (organization_id, title, message, priority, metadata) 
            VALUES (booking.hospital_id, 'Pre-Booking Reminder', 'Your scheduled booking for ' || booking.quantity || ' units of ' || booking.blood_group || ' (' || booking.component_type || ') is due within 24 hours.', 'moderate', jsonb_build_object('type', 'prebooking_reminder', 'booking_id', booking.id));

            -- Notify all blood banks
            FOR bb_org IN SELECT id FROM public.organizations WHERE type = 'blood-bank' LOOP
                INSERT INTO public.notifications (organization_id, title, message, priority, metadata) 
                VALUES (bb_org.id, 'Upcoming Pre-Booking Request', 'Hospital has a scheduled request for ' || booking.quantity || ' units of ' || booking.blood_group || ' (' || booking.component_type || ') due within 24 hours.', 'moderate', jsonb_build_object('type', 'prebooking_reminder', 'booking_id', booking.id, 'hospital_id', booking.hospital_id));
            END LOOP;
        EXCEPTION WHEN OTHERS THEN
             INSERT INTO public.job_failures (job_name, error_message, metadata)
             VALUES ('check_upcoming_prebookings', SQLERRM, jsonb_build_object('booking_id', booking.id));
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update convert_prebooking_to_request to prevent batch failing from 1 error
CREATE OR REPLACE FUNCTION public.convert_prebooking_to_request()
RETURNS void AS $$
DECLARE
    booking RECORD;
    new_request_id UUID;
BEGIN
    FOR booking IN
        SELECT * FROM public.pre_bookings
        WHERE status = 'scheduled'
          AND auto_convert = TRUE
          AND scheduled_date <= now()
    LOOP
        BEGIN
            INSERT INTO public.requests (hospital_id, blood_group, component_type, quantity, urgency, required_date, status) 
            VALUES (booking.hospital_id, booking.blood_group, booking.component_type, booking.quantity, 'normal', booking.scheduled_date::DATE, 'sent')
            RETURNING id INTO new_request_id;

            UPDATE public.pre_bookings SET status = 'fulfilled', updated_at = now() WHERE id = booking.id;

            INSERT INTO public.notifications (organization_id, title, message, priority, metadata) 
            VALUES (booking.hospital_id, 'Pre-Booking Converted to Request', 'Your scheduled pre-booking for ' || booking.quantity || ' units of ' || booking.blood_group || ' has been automatically converted to a blood request.', 'normal', jsonb_build_object('type', 'prebooking_converted', 'booking_id', booking.id, 'request_id', new_request_id));
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO public.job_failures (job_name, error_message, metadata)
            VALUES ('convert_prebooking_to_request', SQLERRM, jsonb_build_object('booking_id', booking.id));
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. Database Optimization Indexes ───────────────────────────────────────
-- Fast lookups for dashboards and discovery algorithms

CREATE INDEX IF NOT EXISTS idx_requests_status_created ON public.requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_org_blood_group ON public.inventory(organization_id, blood_group);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pre_bookings_scheduled_date ON public.pre_bookings(scheduled_date DESC);

-- ── 3. Storage Security Hardening ──────────────────────────────────────────
-- Ensure buckets exist and RLS disables anonymous uploads/downloads
-- NOTE: Uses Supabase storage.buckets / storage.objects if storage extension is active.

INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('org-documents', 'org-documents', false) ON CONFLICT (id) DO NOTHING;

-- Revoke public access on existing and future items in these buckets
CREATE POLICY "Deny general public access to prescriptions"
    ON storage.objects FOR SELECT USING (bucket_id = 'prescriptions' AND auth.role() = 'authenticated');
    
CREATE POLICY "Deny general public access to org-documents"
    ON storage.objects FOR SELECT USING (bucket_id = 'org-documents' AND auth.role() = 'authenticated');

-- End of migration
