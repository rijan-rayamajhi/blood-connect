-- ============================================================================
-- BloodConnect Migration: Fix RLS Recursion
-- Solves "infinite recursion detected in policy for relation profiles"
-- ============================================================================

-- 1. Create a security definer function to check admin status
-- This bypasses RLS on profiles to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- 2. Drop the recursive policy on profiles
DROP POLICY IF EXISTS "admin_read_all_profiles" ON public.profiles;

-- 3. Recreate the policy using the security definer function
CREATE POLICY "admin_read_all_profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Note: Other tables do not cause recursion because they check the profiles
-- table from outside. However, using is_admin() is a best practice. 
-- We will patch the profiles table directly here to fix the immediate login blocker.
