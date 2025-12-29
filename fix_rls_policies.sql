-- IMMEDIATE FIX: Remove all RLS policies from documents and verifications tables
-- This will allow faculty to see ALL documents temporarily

-- Disable RLS completely (temporary fix)
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE verifications DISABLE ROW LEVEL SECURITY;

-- Test if faculty can now see all documents
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

-- Test if faculty can see all verifications
SELECT 
  v.id,
  v.document_id,
  v.status,
  v.created_at,
  d.title as document_title,
  p.first_name,
  p.last_name,
  p.email
FROM verifications v
LEFT JOIN documents d ON v.document_id = d.id
LEFT JOIN profiles p ON d.user_id = p.id
ORDER BY v.created_at DESC
LIMIT 10;

-- Check current user
SELECT id, email, role FROM profiles WHERE email = 'faculty@rvce.edu.in';
