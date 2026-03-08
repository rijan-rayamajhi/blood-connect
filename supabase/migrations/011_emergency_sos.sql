-- ============================================================================
-- Emergency SOS System Migration
-- ============================================================================

-- 1. Extend requests table
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS is_emergency BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS response_deadline TIMESTAMPTZ NULL;

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'moderate', 'normal')),
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'acknowledged')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMPTZ NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_read_notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (
         organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
         user_id = auth.uid()
    );

CREATE POLICY "user_update_notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (
         organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
         user_id = auth.uid()
    )
    WITH CHECK (
         organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
         user_id = auth.uid()
    );

CREATE POLICY "admin_all_notifications"
    ON public.notifications FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 3. Triggers for emergency fields and notifications

CREATE OR REPLACE FUNCTION public.set_emergency_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.urgency = 'critical' THEN
        NEW.is_emergency := TRUE;
        NEW.response_deadline := now() + interval '5 minutes';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_emergency_fields
    BEFORE INSERT ON public.requests
    FOR EACH ROW EXECUTE FUNCTION public.set_emergency_fields();

CREATE OR REPLACE FUNCTION public.create_emergency_notification()
RETURNS TRIGGER AS $$
DECLARE
    bb RECORD;
    hosp_name TEXT;
BEGIN
    IF NEW.is_emergency = TRUE THEN
        SELECT name INTO hosp_name FROM public.organizations WHERE id = NEW.hospital_id;
        
        -- Insert notification for all approved blood banks
        FOR bb IN SELECT id FROM public.organizations WHERE type = 'blood-bank' AND status = 'approved' LOOP
            INSERT INTO public.notifications (organization_id, title, message, priority, metadata)
            VALUES (
                bb.id,
                'Emergency Blood Request',
                'Critical request from ' || hosp_name || ' for ' || NEW.quantity || ' units of ' || NEW.blood_group,
                'critical',
                jsonb_build_object('request_id', NEW.id, 'response_deadline', NEW.response_deadline)
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_create_emergency_notification
    AFTER INSERT ON public.requests
    FOR EACH ROW EXECUTE FUNCTION public.create_emergency_notification();

-- 4. Escalation job function
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
        -- Update request
        UPDATE public.requests 
        SET escalated = TRUE, escalated_at = now(), status = 'escalated'
        WHERE id = req.id;

        -- Insert notification for admins
        INSERT INTO public.notifications (user_id, title, message, priority, metadata)
        SELECT id, 'Emergency Request Escalated', 'Request breached SLA and was escalated.', 'critical', jsonb_build_object('request_id', req.id)
        FROM public.profiles 
        WHERE role = 'admin';
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Expose via pg_cron if available
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule('check_emergency_escalations', '* * * * *', 'SELECT public.check_emergency_escalations();');
    END IF;
END $$;
