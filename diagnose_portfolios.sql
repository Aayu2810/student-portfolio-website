-- First, let's see what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%portfolio%';

-- If portfolios table exists, show its current structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'portfolios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show any existing RLS policies on portfolios table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'portfolios';

-- Check if the table exists at all
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'portfolios'
) as table_exists;
