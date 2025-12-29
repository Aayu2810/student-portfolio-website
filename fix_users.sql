-- Fix users table and add test users if needed
-- Run this in your Supabase SQL Editor

-- 1. First, check what's currently in profiles
SELECT * FROM profiles;

-- 2. If your users are not there, add them manually
-- Replace with actual user IDs from your auth.users table

-- Add aayushi priya (replace UUID with actual auth.users.id)
INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
  'YOUR_AAYUSHI_UUID_HERE', -- Get this from auth.users table
  'aayushi.priya@example.com',
  'aayushi',
  'priya',
  'student',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Add kruthi krishna (replace UUID with actual auth.users.id)
INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
  'YOUR_KRUTHI_UUID_HERE', -- Get this from auth.users table
  'kruthi.krishna@example.com',
  'kruthi',
  'krishna',
  'student',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 3. Check auth.users to get the correct UUIDs
SELECT id, email, created_at FROM auth.users 
WHERE email LIKE '%aayushi%' OR email LIKE '%kruthi%';

-- 4. Verify the users were added
SELECT * FROM profiles 
WHERE first_name IN ('aayushi', 'kruthi') OR last_name IN ('priya', 'krishna');

-- 5. Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
