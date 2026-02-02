-- Create RPC function to get user information from auth.users
CREATE OR REPLACE FUNCTION get_user_info(user_ids UUID[])
RETURNS TABLE (
  id UUID,
  email TEXT,
  raw_user_meta_data JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data
  FROM auth.users au
  WHERE au.id = ANY(user_ids)
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_info TO authenticated;
