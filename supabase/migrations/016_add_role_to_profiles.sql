-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student';

-- Update existing faculty users if needed (optional)
-- UPDATE profiles SET role = 'faculty' WHERE email LIKE '%@faculty.%' OR email LIKE '%@rvce.edu.in%';