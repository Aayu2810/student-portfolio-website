-- COMPLETE BYPASS: Force faculty access to all data
-- This creates a service role function that bypasses RLS

-- Step 1: Create superuser function (bypasses RLS)
CREATE OR REPLACE FUNCTION get_all_documents_for_faculty()
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  created_at TIMESTAMPTZ,
  is_public BOOLEAN,
  file_url TEXT,
  storage_path TEXT,
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.category,
    d.created_at,
    d.is_public,
    d.file_url,
    d.storage_path,
    d.user_id,
    p.first_name,
    p.last_name,
    p.email,
    p.role,
    d.file_name,
    d.file_type,
    d.file_size
  FROM documents d
  LEFT JOIN profiles p ON d.user_id = p.id
  ORDER BY d.created_at DESC;
END;
$$;

-- Step 2: Create function for all verifications
CREATE OR REPLACE FUNCTION get_all_verifications_for_faculty()
RETURNS TABLE (
  id UUID,
  document_id UUID,
  status TEXT,
  verifier_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  document_title TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.document_id,
    v.status,
    v.verifier_id,
    v.created_at,
    v.updated_at,
    d.title as document_title,
    p.first_name,
    p.last_name,
    p.email,
    p.role
  FROM verifications v
  LEFT JOIN documents d ON v.document_id = d.id
  LEFT JOIN profiles p ON d.user_id = p.id
  ORDER BY v.created_at DESC;
END;
$$;

-- Step 3: Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_all_documents_for_faculty() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_verifications_for_faculty() TO authenticated;

-- Step 4: Test the functions
SELECT * FROM get_all_documents_for_faculty() LIMIT 10;
SELECT * FROM get_all_verifications_for_faculty() LIMIT 10;

-- Step 5: Check if faculty user exists and has correct role
SELECT id, email, role FROM profiles WHERE email = 'faculty@rvce.edu.in';
