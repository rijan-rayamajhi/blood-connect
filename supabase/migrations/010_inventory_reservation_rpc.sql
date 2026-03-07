-- ============================================================================
-- Inventory Reservation RPC
-- 原子的な在庫予約
-- ============================================================================

DROP FUNCTION IF EXISTS public.reserve_inventory_unit(UUID, UUID);

CREATE OR REPLACE FUNCTION public.reserve_inventory_unit(
    p_unit_id UUID,
    p_request_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.inventory
    SET 
        status = 'reserved',
        reserved_for_request_id = p_request_id,
        updated_at = NOW()
    WHERE id = p_unit_id
    AND status IN ('available', 'near-expiry');

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventory unit % not found or not available for reservation', p_unit_id;
    END IF;
END;
$$;
