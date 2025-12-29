-- Enable RLS policies for faculty to access all profiles
-- Run this in your Supabase SQL Editor

-- 1. Check current RLS policies on profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. Drop existing policies if they're blocking
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- 3. Create policy to allow faculty to view all profiles
CREATE POLICY "Faculty can view all profiles" ON profiles
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'faculty' OR
    auth.uid() = id
  );

-- 4. Create policy to allow service role (for bypassing RLS)
CREATE POLICY "Service role can access all profiles" ON profiles
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- 5. Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Test the policy
SELECT COUNT(*) as total_profiles FROM profiles;

-- 7. Create a function to bypass RLS for faculty
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT p.id, p.email, p.first_name, p.last_name, p.role, p.created_at, p.updated_at
  FROM profiles p
  WHERE 
    -- Allow faculty to see all profiles
    auth.jwt() ->> 'role' = 'faculty' OR
    -- Allow users to see own profile
    auth.uid() = p.id;
END;
$$;
