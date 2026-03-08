-- ============================================================================
-- Admin Analytics Backend Extension
-- Creates RPCs for admin dashboard metrics and monitoring
-- ============================================================================

-- ── 1. get_admin_metrics ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_admin_metrics()
RETURNS JSON AS $$
DECLARE
    v_total_blood_banks INT;
    v_total_hospitals INT;
    v_active_users INT;
    v_total_requests INT;
    v_active_emergency_requests INT;
    v_pending_requests INT;
    v_fulfilled_requests INT;
BEGIN
    SELECT COUNT(*) INTO v_total_blood_banks FROM public.organizations WHERE type = 'blood-bank';
    SELECT COUNT(*) INTO v_total_hospitals FROM public.organizations WHERE type = 'hospital';
    SELECT COUNT(*) INTO v_active_users FROM public.profiles;
    SELECT COUNT(*) INTO v_total_requests FROM public.requests;
    
    SELECT COUNT(*) INTO v_active_emergency_requests FROM public.requests 
    WHERE (is_emergency = TRUE OR urgency = 'critical') AND status NOT IN ('collected', 'cancelled', 'rejected');
    
    SELECT COUNT(*) INTO v_pending_requests FROM public.requests 
    WHERE status IN ('sent', 'accepted', 'partially-accepted', 'escalated');
    
    SELECT COUNT(*) INTO v_fulfilled_requests FROM public.requests 
    WHERE status = 'collected';

    RETURN json_build_object(
        'total_blood_banks', v_total_blood_banks,
        'total_hospitals', v_total_hospitals,
        'active_users', v_active_users,
        'total_requests', v_total_requests,
        'active_emergency_requests', v_active_emergency_requests,
        'pending_requests', v_pending_requests,
        'fulfilled_requests', v_fulfilled_requests
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. blood_supply_demand ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.blood_supply_demand()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    WITH supply AS (
        SELECT blood_group, COUNT(*) as total_supply 
        FROM public.inventory 
        WHERE status IN ('available', 'near-expiry') 
        GROUP BY blood_group
    ),
    demand AS (
        SELECT blood_group, SUM(quantity) as total_demand 
        FROM public.requests 
        WHERE status IN ('sent', 'accepted', 'partially-accepted', 'escalated') 
        GROUP BY blood_group
    ),
    all_groups AS (
        SELECT DISTINCT blood_group FROM public.inventory
        UNION
        SELECT DISTINCT blood_group FROM public.requests
    )
    SELECT COALESCE(json_agg(
        json_build_object(
            'blood_group', g.blood_group,
            'total_supply', COALESCE(s.total_supply, 0),
            'total_demand', COALESCE(d.total_demand, 0),
            'supply_demand_ratio', CASE 
                WHEN COALESCE(d.total_demand, 0) = 0 THEN 
                    CASE WHEN COALESCE(s.total_supply, 0) > 0 THEN 999 ELSE 0 END
                ELSE ROUND((COALESCE(s.total_supply, 0)::NUMERIC / d.total_demand::NUMERIC), 2)
            END
        )
    ), '[]'::json) INTO result
    FROM all_groups g
    LEFT JOIN supply s ON g.blood_group = s.blood_group
    LEFT JOIN demand d ON g.blood_group = d.blood_group;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. active_emergency_requests ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.active_emergency_requests()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(json_agg(
        json_build_object(
            'request_id', r.id,
            'hospital', o.name,
            'blood_group', r.blood_group,
            'urgency', r.urgency,
            'status', r.status,
            'elapsed_time_minutes', EXTRACT(EPOCH FROM (now() - r.created_at)) / 60
        )
    ), '[]'::json) INTO result
    FROM public.requests r
    JOIN public.organizations o ON r.hospital_id = o.id
    WHERE (r.is_emergency = TRUE OR r.urgency = 'critical')
      AND r.status NOT IN ('collected', 'cancelled', 'rejected');

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 4. organization_activity ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.organization_activity()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(json_agg(
        json_build_object(
            'organization_id', o.id,
            'organization_name', o.name,
            'type', o.type,
            'requests_handled', (
                SELECT COUNT(*) FROM public.requests r 
                WHERE (r.hospital_id = o.id OR r.blood_bank_id = o.id)
            ),
            'inventory_available', (
                SELECT COUNT(*) FROM public.inventory i 
                WHERE i.organization_id = o.id AND i.status = 'available'
            ),
            'donors_count', (
                SELECT COUNT(*) FROM public.donors d 
                WHERE d.organization_id = o.id
            ),
            'staff_count', (
                SELECT COUNT(*) FROM public.staff s 
                WHERE s.organization_id = o.id
            )
        )
    ), '[]'::json) INTO result
    FROM public.organizations o;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
