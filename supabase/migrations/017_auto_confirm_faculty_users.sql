-- Auto-confirm email for faculty users
-- This ensures faculty users can log in without email confirmation

-- Function to auto-confirm faculty users
CREATE OR REPLACE FUNCTION auto_confirm_faculty_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user is faculty
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = NEW.id AND role IN ('faculty', 'admin')
  ) THEN
    -- Auto-confirm email for faculty users
    UPDATE auth.users
    SET 
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW())
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-confirm faculty users when profile role is updated
CREATE OR REPLACE FUNCTION auto_confirm_on_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is changed to faculty/admin, auto-confirm email
  IF (NEW.role IN ('faculty', 'admin') AND OLD.role NOT IN ('faculty', 'admin')) THEN
    UPDATE auth.users
    SET 
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmed_at = COALESCE(confirmed_at, NOW())
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_auto_confirm_faculty ON public.profiles;
CREATE TRIGGER trigger_auto_confirm_faculty
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role IN ('faculty', 'admin'))
  EXECUTE FUNCTION auto_confirm_on_role_update();

-- Manually confirm existing faculty users
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  confirmed_at = COALESCE(confirmed_at, NOW())
WHERE id IN (
  SELECT id FROM public.profiles WHERE role IN ('faculty', 'admin')
);

