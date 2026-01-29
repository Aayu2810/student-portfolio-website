-- Create faculty user if it doesn't exist
-- This script creates a faculty user with email: faculty@rvce.edu.in and password: faculty123

DO $$
DECLARE
  faculty_user_id UUID;
  faculty_email TEXT := 'faculty@rvce.edu.in';
BEGIN
  -- Check if user already exists in auth.users
  SELECT id INTO faculty_user_id
  FROM auth.users
  WHERE email = faculty_email;

  -- If user doesn't exist, create it
  IF faculty_user_id IS NULL THEN
    -- Insert into auth.users (this would typically be done through Supabase Auth API)
    -- For now, we'll just ensure the profile exists if the user is created through the UI
    RAISE NOTICE 'Faculty user does not exist. Please create the user through Supabase Auth Dashboard or API first.';
    RAISE NOTICE 'Email: %', faculty_email;
    RAISE NOTICE 'Password: faculty123';
    RAISE NOTICE 'After creating the user, run the profile update below.';
  ELSE
    -- Update or insert profile with faculty role
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (faculty_user_id, faculty_email, 'Faculty', 'Member', 'faculty')
    ON CONFLICT (id) DO UPDATE
    SET 
      role = 'faculty',
      email = faculty_email,
      updated_at = NOW();
    
    RAISE NOTICE 'Faculty profile created/updated for user: %', faculty_user_id;
  END IF;
END $$;

-- Note: To create the user through Supabase Auth, you can:
-- 1. Use Supabase Dashboard > Authentication > Users > Add User
-- 2. Or use the Supabase Management API
-- 3. Or use the signUp function in the app

-- After the user is created in auth.users, the profile will be automatically created
-- by the trigger, but we ensure the role is set to 'faculty'


