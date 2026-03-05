-- ============================================================================
-- BloodConnect Migration: Auto-Register Trigger
-- Automatically creates Organization & Profile rows when a new user signs up.
-- This is more robust than client-side inserts.
-- ============================================================================

-- 1. Create a function to handle new user registration automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_role TEXT;
  org_name TEXT;
BEGIN
  -- Extract metadata passed from the frontend signUp() 'options.data' property
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'hospital');
  org_name := COALESCE(new.raw_user_meta_data->>'name', 'New Organization');

  -- If the user is NOT an admin, create an organization first
  IF user_role != 'admin' THEN
    INSERT INTO public.organizations (name, type, email, status)
    VALUES (org_name, user_role, new.email, 'pending')
    RETURNING id INTO new_org_id;
  ELSE
    new_org_id := NULL;
  END IF;

  -- Create the profile record
  INSERT INTO public.profiles (id, organization_id, name, email, role)
  VALUES (new.id, new_org_id, org_name, new.email, user_role);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
