-- Debug script to check database structure and data
-- Run this in your Supabase SQL Editor

-- 1. Check if profiles table exists and its structure
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Check all data in profiles table
SELECT * FROM profiles LIMIT 10;

-- 3. Check users by role
SELECT role, COUNT(*) as count 
FROM profiles 
GROUP BY role;

-- 4. Check specific student users
SELECT id, email, first_name, last_name, role 
FROM profiles 
WHERE role = 'student' OR role IS NULL
ORDER BY first_name;

-- 5. Check documents table structure
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;

-- 6. Check documents with user info
SELECT d.id, d.title, d.user_id, p.first_name, p.last_name, p.email, p.role
FROM documents d
LEFT JOIN profiles p ON d.user_id = p.id
LIMIT 10;

-- 7. Check if there are any documents at all
SELECT COUNT(*) as total_documents FROM documents;
