-- ============================================================================
-- BloodConnect Discovery Engine Migration
-- Creates: PostGIS extension, geography columns, geospatial indexes, and RPC function
-- ============================================================================

-- ── 1. Enable PostGIS ────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS postgis;

-- ── 2. Extend organizations Table ────────────────────────────────────────────

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326),
ADD COLUMN IF NOT EXISTS average_response_minutes INT DEFAULT 15;

-- ── 3. Trigger to Auto-Populate Location ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_organization_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    ELSE
        NEW.location := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_organization_location ON public.organizations;
CREATE TRIGGER trg_update_organization_location
    BEFORE INSERT OR UPDATE OF latitude, longitude ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.update_organization_location();

-- Update existing data
UPDATE public.organizations
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- ── 4. Spatial Index ──────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_organizations_location 
    ON public.organizations USING GIST (location);

-- ── 5. Discovery Engine RPC Function ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.discover_blood_banks(
    hospital_lat DOUBLE PRECISION,
    hospital_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION,
    search_blood_group TEXT DEFAULT NULL,
    min_quantity INT DEFAULT NULL,
    max_response_time INT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_km DOUBLE PRECISION,
    average_response_minutes INT,
    available_inventory JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH bank_inventory AS (
        SELECT 
            i.organization_id,
            jsonb_agg(
                json_build_object(
                    'bloodGroup', i.blood_group,
                    'quantity', i.quantity
                )
            ) as available_inventory,
            -- Check if specific group requirement is met
            BOOL_OR(
                (search_blood_group IS NULL OR i.blood_group = search_blood_group)
                AND 
                (min_quantity IS NULL OR 
                 (i.blood_group = search_blood_group AND i.quantity >= min_quantity))
            ) as meets_requirements
        FROM (
            -- Aggregate by blood group first to sum quantities of the same group
            SELECT organization_id, blood_group, sum(quantity) as quantity
            FROM public.inventory
            WHERE status IN ('available', 'near-expiry')
            GROUP BY organization_id, blood_group
        ) i
        GROUP BY i.organization_id
    )
    SELECT 
        o.id,
        o.name,
        o.latitude,
        o.longitude,
        -- Distance in meters converted to km
        (ST_Distance(o.location, ST_SetSRID(ST_MakePoint(hospital_lng, hospital_lat), 4326)) / 1000.0) as distance_km,
        o.average_response_minutes,
        COALESCE(bi.available_inventory, '[]'::jsonb) as available_inventory
    FROM public.organizations o
    LEFT JOIN bank_inventory bi ON o.id = bi.organization_id
    WHERE 
        o.type = 'blood-bank'
        AND o.status = 'approved'
        AND o.location IS NOT NULL
        -- Geospatial filtering
        AND ST_DWithin(
            o.location, 
            ST_SetSRID(ST_MakePoint(hospital_lng, hospital_lat), 4326), 
            radius_km * 1000
        )
        -- Response time filtering
        AND (max_response_time IS NULL OR o.average_response_minutes <= max_response_time)
        -- Inventory requirements filtering
        AND (
            (search_blood_group IS NULL AND min_quantity IS NULL)
            OR (bi.meets_requirements = TRUE)
        )
    ORDER BY 
        (ST_Distance(o.location, ST_SetSRID(ST_MakePoint(hospital_lng, hospital_lat), 4326))) ASC,
        o.average_response_minutes ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
