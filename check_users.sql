-- Direct check of profiles table to find your users
-- Run this in Supabase SQL Editor

-- 1. Check if profiles table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';

-- 2. Check exact structure of profiles table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Get ALL records from profiles table
SELECT * FROM profiles;

-- 4. Search specifically for your users
SELECT * FROM profiles 
WHERE first_name ILIKE '%aayushi%' 
   OR last_name ILIKE '%aayushi%'
   OR first_name ILIKE '%kruthi%'
   OR last_name ILIKE '%kruthi%';

-- 5. Check if there are any users at all
SELECT COUNT(*) as total_profiles FROM profiles;

-- 6. Check if auth.users has your users
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%aayushi%' OR email LIKE '%kruthi%';
