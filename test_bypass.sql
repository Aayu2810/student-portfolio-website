-- Quick test to see if bypass functions work
-- Run this in Supabase SQL Editor

-- Step 1: Check if functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%faculty%';

-- Step 2: Test document bypass function
SELECT * FROM get_all_documents_for_faculty() LIMIT 5;

-- Step 3: Test verification bypass function  
SELECT * FROM get_all_verifications_for_faculty() LIMIT 5;

-- Step 4: Check if there are any pending documents
SELECT 
  d.id, 
  d.title, 
  d.user_id,
  d.is_public,
  p.first_name, 
  p.last_name, 
  p.email,
  p.role
FROM documents d
LEFT JOIN profiles p ON d.user_id = p.id
WHERE d.is_public = false
ORDER BY d.created_at DESC
LIMIT 10;

-- Step 5: Check current user role
SELECT id, email, role FROM profiles WHERE email = 'faculty@rvce.edu.in';
