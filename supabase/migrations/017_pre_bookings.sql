-- ============================================================================
-- Pre-Booking Scheduling System Migration
-- Creates: pre_bookings table, RLS, Realtime, Scheduled Job functions
-- ============================================================================

-- ── 1. Pre-Bookings Table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pre_bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id     UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    blood_group     TEXT NOT NULL,
    component_type  TEXT NOT NULL,
    quantity        INT NOT NULL CHECK (quantity > 0),
    scheduled_date  TIMESTAMPTZ NOT NULL,
    notes           TEXT NULL,
    status          TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'fulfilled', 'cancelled')),
    auto_convert    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pre_bookings_hospital_id    ON public.pre_bookings(hospital_id);
CREATE INDEX IF NOT EXISTS idx_pre_bookings_status         ON public.pre_bookings(status);
CREATE INDEX IF NOT EXISTS idx_pre_bookings_scheduled_date ON public.pre_bookings(scheduled_date);

-- ── 2. Auto-update updated_at ─────────────────────────────────────────────────

CREATE TRIGGER set_pre_bookings_updated_at
    BEFORE UPDATE ON public.pre_bookings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 3. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.pre_bookings ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "admin_all_pre_bookings"
    ON public.pre_bookings FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Hospitals: manage their own pre-bookings
CREATE POLICY "hospital_select_pre_bookings"
    ON public.pre_bookings FOR SELECT TO authenticated
    USING (
        hospital_id IN (
            SELECT organization_id FROM public.profiles
            WHERE id = auth.uid() AND role = 'hospital'
        )
    );

CREATE POLICY "hospital_insert_pre_bookings"
    ON public.pre_bookings FOR INSERT TO authenticated
    WITH CHECK (
        hospital_id IN (
            SELECT organization_id FROM public.profiles
            WHERE id = auth.uid() AND role = 'hospital'
        )
    );

CREATE POLICY "hospital_update_pre_bookings"
    ON public.pre_bookings FOR UPDATE TO authenticated
    USING (
        hospital_id IN (
            SELECT organization_id FROM public.profiles
            WHERE id = auth.uid() AND role = 'hospital'
        )
    )
    WITH CHECK (
        hospital_id IN (
            SELECT organization_id FROM public.profiles
            WHERE id = auth.uid() AND role = 'hospital'
        )
    );

CREATE POLICY "hospital_delete_pre_bookings"
    ON public.pre_bookings FOR DELETE TO authenticated
    USING (
        hospital_id IN (
            SELECT organization_id FROM public.profiles
            WHERE id = auth.uid() AND role = 'hospital'
        )
    );

-- Blood Banks: can view all scheduled pre-bookings (to plan supply)
CREATE POLICY "blood_bank_view_pre_bookings"
    ON public.pre_bookings FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'blood-bank'
        )
        AND status = 'scheduled'
    );

-- ── 4. Enable Realtime ───────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.pre_bookings;

-- ── 5. Reminder Notification Job ─────────────────────────────────────────────
-- Run this function periodically (every hour via pg_cron or Supabase Edge Function).
-- It notifies hospitals and all blood banks about bookings due within 24 hours.

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
          -- Avoid duplicate notifications by checking if one was sent in the last hour
          AND NOT EXISTS (
              SELECT 1 FROM public.notifications n
              WHERE n.organization_id = pb.hospital_id
                AND n.metadata->>'type' = 'prebooking_reminder'
                AND n.metadata->>'booking_id' = pb.id::TEXT
                AND n.created_at > (now() - INTERVAL '1 hour')
          )
    LOOP
        -- Notify the hospital
        INSERT INTO public.notifications (
            organization_id,
            title,
            message,
            priority,
            metadata
        ) VALUES (
            booking.hospital_id,
            'Pre-Booking Reminder',
            'Your scheduled booking for ' || booking.quantity || ' units of ' ||
                booking.blood_group || ' (' || booking.component_type || ') is due within 24 hours.',
            'moderate',
            jsonb_build_object(
                'type', 'prebooking_reminder',
                'booking_id', booking.id
            )
        );

        -- Notify all blood banks
        FOR bb_org IN
            SELECT id FROM public.organizations WHERE type = 'blood-bank'
        LOOP
            INSERT INTO public.notifications (
                organization_id,
                title,
                message,
                priority,
                metadata
            ) VALUES (
                bb_org.id,
                'Upcoming Pre-Booking Request',
                'Hospital has a scheduled request for ' || booking.quantity || ' units of ' ||
                    booking.blood_group || ' (' || booking.component_type || ') due within 24 hours.',
                'moderate',
                jsonb_build_object(
                    'type', 'prebooking_reminder',
                    'booking_id', booking.id,
                    'hospital_id', booking.hospital_id
                )
            );
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. Auto-Conversion Job ────────────────────────────────────────────────────
-- When scheduled_date is reached and auto_convert=true, create a real request
-- and mark the pre-booking as fulfilled.

CREATE OR REPLACE FUNCTION public.convert_prebooking_to_request()
RETURNS void AS $$
DECLARE
    booking RECORD;
    new_request_id UUID;
BEGIN
    FOR booking IN
        SELECT *
        FROM public.pre_bookings
        WHERE status = 'scheduled'
          AND auto_convert = TRUE
          AND scheduled_date <= now()
    LOOP
        -- Insert into requests table
        INSERT INTO public.requests (
            hospital_id,
            blood_group,
            component_type,
            quantity,
            urgency,
            required_date,
            status
        ) VALUES (
            booking.hospital_id,
            booking.blood_group,
            booking.component_type,
            booking.quantity,
            'normal',
            booking.scheduled_date::DATE,
            'sent'
        )
        RETURNING id INTO new_request_id;

        -- Mark pre-booking fulfilled
        UPDATE public.pre_bookings
        SET status = 'fulfilled', updated_at = now()
        WHERE id = booking.id;

        -- Notify hospital
        INSERT INTO public.notifications (
            organization_id,
            title,
            message,
            priority,
            metadata
        ) VALUES (
            booking.hospital_id,
            'Pre-Booking Converted to Request',
            'Your scheduled pre-booking for ' || booking.quantity || ' units of ' ||
                booking.blood_group || ' has been automatically converted to a blood request.',
            'normal',
            jsonb_build_object(
                'type', 'prebooking_converted',
                'booking_id', booking.id,
                'request_id', new_request_id
            )
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 7. Schedule via pg_cron (run in Supabase SQL Editor after enabling pg_cron) ──
-- NOTE: Uncomment and run manually in Supabase Dashboard > SQL Editor after
--       enabling the pg_cron extension in Database > Extensions.
--
-- SELECT cron.schedule(
--     'check-upcoming-prebookings',
--     '0 * * * *',  -- every hour
--     $$SELECT public.check_upcoming_prebookings()$$
-- );
--
-- SELECT cron.schedule(
--     'convert-prebookings-to-requests',
--     '*/5 * * * *',  -- every 5 minutes
--     $$SELECT public.convert_prebooking_to_request()$$
-- );
