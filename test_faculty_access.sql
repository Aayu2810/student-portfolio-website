-- Test script to check if faculty access is working
-- Run this in Supabase SQL Editor after applying the fix

-- 1. Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('documents', 'verifications')
ORDER BY tablename, policyname;

-- 2. Test faculty user access (replace with actual faculty user ID)
-- First, get the faculty user ID
SELECT id, email, role FROM profiles WHERE email = 'faculty@rvce.edu.in';

-- 3. Test if faculty can see all documents (replace FACULTY_USER_ID with actual ID)
-- This simulates what the faculty dashboard query does
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'FACULTY_USER_ID'; -- Replace with actual faculty UUID

SELECT 
  d.id, 
  d.title, 
  d.user_id,
  p.first_name, 
  p.last_name, 
  p.email,
  p.role as user_role
FROM documents d
LEFT JOIN profiles p ON d.user_id = p.id
ORDER BY d.created_at DESC
LIMIT 10;

-- 4. Count total documents faculty should see
SELECT COUNT(*) as total_documents FROM documents;

-- 5. Check if avkruthi has documents (replace with actual user ID)
SELECT id, title, created_at FROM documents WHERE user_id = 'AVKRUTHI_USER_ID'; -- Replace with actual UUID
