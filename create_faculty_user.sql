-- Create faculty user directly in Supabase without email confirmation
-- Run this in your Supabase SQL Editor

-- Step 1: Insert user into auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- instance_id (default)
  gen_random_uuid(), -- Generate a random UUID for the user
  'authenticated',
  'authenticated',
  'faculty@rvce.edu.in',
  crypt('faculty123', gen_salt('bf')), -- Encrypt the password
  now(), -- Set email_confirmed_at to now to skip email confirmation
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  now(),
  now(),
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Faculty", "last_name": "User"}',
  false,
  NULL,
  NULL,
  NULL
) RETURNING id;

-- Step 2: After running the above, copy the returned UUID and use it in the query below
-- Replace 'FACULTY_USER_ID_HERE' with the actual UUID returned from the query above

-- Step 3: Create profile for the faculty user
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  'FACULTY_USER_ID_HERE', -- Replace with the actual UUID from step 1
  'faculty@rvce.edu.in',
  'Faculty',
  'User',
  'faculty',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'faculty',
  updated_at = now();

-- Step 4: Verify the faculty user was created
SELECT * FROM public.profiles WHERE email = 'faculty@rvce.edu.in';
