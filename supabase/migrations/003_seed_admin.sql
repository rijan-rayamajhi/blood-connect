-- ============================================================================
-- BloodConnect Admin Seeding
-- Manually creates an admin user in auth.users and public.profiles
-- Run this in the Supabase SQL Editor to bootstrap your system
-- ============================================================================

DO $$
DECLARE
  -- 1. SET YOUR ADMIN DETAILS HERE
  admin_email TEXT := 'admin@bloodconnect.com';
  admin_password TEXT := 'SecureAdmin123!'; 
  admin_id UUID := gen_random_uuid();
  existing_id UUID;
BEGIN
  -- 2. Check if a malformed user already exists and clean it up
  SELECT id INTO existing_id FROM auth.users WHERE email = admin_email;
  
  IF existing_id IS NOT NULL THEN
    RAISE NOTICE 'Cleaning up existing user with email: %', admin_email;
    DELETE FROM public.profiles WHERE id = existing_id;
    DELETE FROM auth.users WHERE id = existing_id;
  END IF;

  -- 3. Insert into auth.users (Properly setting 'aud' and 'role')
  INSERT INTO auth.users (
    id, 
    instance_id, 
    aud,
    role, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at, 
    confirmation_token, 
    email_change, 
    email_change_token_new, 
    recovery_token
  )
  VALUES (
    admin_id, 
    '00000000-0000-0000-0000-000000000000', 
    'authenticated',
    'authenticated', 
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', 'System Admin', 'role', 'admin'),
    now(), 
    now(), 
    '', '', '', ''
  );

  -- 4. Create the profile in the public schema
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    admin_id,
    'System Admin',
    admin_email,
    'admin'
  );

  RAISE NOTICE 'Admin created properly with ID: %', admin_id;
END $$;
