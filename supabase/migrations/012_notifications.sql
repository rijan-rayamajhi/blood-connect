-- ============================================================================
-- Realtime Notifications Migration
-- ============================================================================

-- 1. Extend notifications table
ALTER TABLE public.notifications
RENAME COLUMN user_id TO recipient_user_id;

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS auto_close BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL;

-- 2. Update RLS policies
DROP POLICY IF EXISTS "user_read_notifications" ON public.notifications;
DROP POLICY IF EXISTS "user_update_notifications" ON public.notifications;

CREATE POLICY "user_read_notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (
         organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
         recipient_user_id = auth.uid()
    );

CREATE POLICY "user_update_notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (
         organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
         recipient_user_id = auth.uid()
    )
    WITH CHECK (
         organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) OR
         recipient_user_id = auth.uid()
    );

-- 3. Fix check_emergency_escalations to use recipient_user_id
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
        INSERT INTO public.notifications (recipient_user_id, title, message, priority, metadata)
        SELECT id, 'Emergency Request Escalated', 'Request breached SLA and was escalated.', 'critical', jsonb_build_object('request_id', req.id)
        FROM public.profiles 
        WHERE role = 'admin';
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Inventory Low Stock Trigger
CREATE OR REPLACE FUNCTION public.low_stock_notification()
RETURNS TRIGGER AS $$
DECLARE
    threshold INT;
BEGIN
    -- Get threshold
    SELECT low_stock_threshold INTO threshold FROM public.system_config WHERE id = 1;
    
    -- Check if it dropped below threshold
    IF (TG_OP = 'INSERT' AND NEW.quantity < threshold) OR
       (TG_OP = 'UPDATE' AND OLD.quantity >= threshold AND NEW.quantity < threshold) THEN
       
       INSERT INTO public.notifications (organization_id, title, message, priority, metadata)
       VALUES (
           NEW.organization_id,
           'Low Inventory Alert',
           'Stock for ' || NEW.blood_group || ' (' || NEW.component_type || ') has dropped below the threshold (' || threshold || '). Current: ' || NEW.quantity,
           'moderate',
           jsonb_build_object('type', 'inventory_low_stock', 'blood_group', NEW.blood_group, 'component_type', NEW.component_type, 'inventory_id', NEW.id)
       );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_low_stock_notification
    AFTER INSERT OR UPDATE ON public.inventory
    FOR EACH ROW EXECUTE FUNCTION public.low_stock_notification();

-- 5. Request Status Change Trigger
CREATE OR REPLACE FUNCTION public.request_status_notification()
RETURNS TRIGGER AS $$
DECLARE
    bb_name TEXT;
BEGIN
    -- Only act on status changes
    IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
        -- Send notification to hospital organization
        IF NEW.status IN ('accepted', 'partially-accepted', 'rejected', 'collected', 'cancelled') THEN
            
            -- Try to get blood bank name if blood_bank_id is set
            IF NEW.blood_bank_id IS NOT NULL THEN
                SELECT name INTO bb_name FROM public.organizations WHERE id = NEW.blood_bank_id;
            ELSE
                bb_name := 'A Blood Bank';
            END IF;
        
            INSERT INTO public.notifications (organization_id, title, message, priority, metadata)
            VALUES (
                NEW.hospital_id,
                'Blood Request Update',
                'Your request for ' || NEW.quantity || ' units of ' || NEW.blood_group || ' has been updated to: ' || NEW.status || ' by ' || bb_name,
                'normal',
                jsonb_build_object('type', 'request_status_update', 'request_id', NEW.id, 'status', NEW.status)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_request_status_notification
    AFTER UPDATE ON public.requests
    FOR EACH ROW EXECUTE FUNCTION public.request_status_notification();
