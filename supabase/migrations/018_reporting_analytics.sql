-- ============================================================================
-- Reporting & Analytics Migration
-- Creates: Indexes, RPC Functions for Reports
-- ============================================================================

-- ── 1. Performance Optimization Indexes ──────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry_date ON public.inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_donor_donations_donation_date ON public.donor_donations(donation_date);

-- ── 2. RPC: Inventory Report ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.inventory_report(
    start_date DATE,
    end_date DATE,
    p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
    blood_group TEXT,
    component_type TEXT,
    total_units BIGINT,
    expired_units BIGINT,
    near_expiry_units BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.blood_group,
        i.component_type,
        COUNT(i.id) AS total_units,
        COUNT(i.id) FILTER (WHERE i.status = 'expired') AS expired_units,
        COUNT(i.id) FILTER (WHERE i.status = 'near-expiry') AS near_expiry_units
    FROM public.inventory i
    WHERE i.collection_date >= start_date 
      AND i.collection_date <= end_date
      AND (p_organization_id IS NULL OR i.organization_id = p_organization_id)
    GROUP BY i.blood_group, i.component_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. RPC: Requests Report ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.requests_report(
    start_date DATE,
    end_date DATE,
    p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_requests BIGINT,
    fulfilled_requests BIGINT,
    rejected_requests BIGINT,
    cancelled_requests BIGINT,
    average_response_time NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH request_stats AS (
        SELECT 
            r.id,
            r.status,
            r.created_at,
            (SELECT MIN(t.timestamp) 
             FROM public.request_timeline t 
             WHERE t.request_id = r.id AND t.status != 'sent'
            ) AS first_response_time
        FROM public.requests r
        WHERE r.created_at >= start_date 
          AND r.created_at <= end_date + interval '1 day'
          AND (p_organization_id IS NULL OR r.blood_bank_id = p_organization_id)
    )
    SELECT 
        COUNT(*) AS total_requests,
        COUNT(*) FILTER (WHERE status = 'collected') AS fulfilled_requests,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_requests,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_requests,
        ROUND(AVG(EXTRACT(EPOCH FROM (first_response_time - created_at))/60.0)::numeric, 2) AS average_response_time
    FROM request_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 4. RPC: Donor Report ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.donor_report(
    start_date DATE,
    end_date DATE,
    p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_donors BIGINT,
    active_donors BIGINT,
    deferred_donors BIGINT,
    total_donations BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH donor_stats AS (
        SELECT
            d.id,
            d.status,
            (SELECT COUNT(*) FROM public.donor_donations dd 
             WHERE dd.donor_id = d.id 
               AND dd.donation_date >= start_date 
               AND dd.donation_date <= end_date) AS donations_in_period
        FROM public.donors d
        WHERE (p_organization_id IS NULL OR d.organization_id = p_organization_id)
    )
    SELECT
        COUNT(*) AS total_donors,
        COUNT(*) FILTER (WHERE status = 'Available') AS active_donors,
        COUNT(*) FILTER (WHERE status = 'Temporary Deferral') AS deferred_donors,
        COALESCE(SUM(donations_in_period), 0) AS total_donations
    FROM donor_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. RPC: Hospital Consumption Analytic ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.hospital_consumption(
    start_date DATE,
    end_date DATE,
    p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
    blood_group TEXT,
    total_units_requested BIGINT,
    total_units_received BIGINT,
    fulfillment_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.blood_group,
        SUM(r.quantity) AS total_units_requested,
        COALESCE(SUM(r.quantity) FILTER (WHERE r.status = 'collected'), 0) AS total_units_received,
        CASE COALESCE(SUM(r.quantity), 0)
            WHEN 0 THEN 0.0
            ELSE ROUND((COALESCE(SUM(r.quantity) FILTER (WHERE r.status = 'collected'), 0) * 100.0 / SUM(r.quantity))::numeric, 2)
        END AS fulfillment_rate
    FROM public.requests r
    WHERE r.created_at >= start_date 
      AND r.created_at <= end_date + interval '1 day'
      AND (p_organization_id IS NULL OR r.hospital_id = p_organization_id)
    GROUP BY r.blood_group;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. Expose RPCs via PostgREST/Supabase ────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.inventory_report(DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.requests_report(DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.donor_report(DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hospital_consumption(DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.inventory_report(DATE, DATE, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.requests_report(DATE, DATE, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.donor_report(DATE, DATE, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.hospital_consumption(DATE, DATE, UUID) TO anon;
