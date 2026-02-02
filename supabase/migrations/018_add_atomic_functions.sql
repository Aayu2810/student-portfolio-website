-- Create atomic storage increment/decrement functions to prevent race conditions

-- Function to atomically increment storage usage
CREATE OR REPLACE FUNCTION increment_storage(user_id_param UUID, bytes BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET storage_used = COALESCE(storage_used, 0) + bytes
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to atomically decrement storage usage
CREATE OR REPLACE FUNCTION decrement_storage(user_id_param UUID, bytes BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET storage_used = GREATEST(0, COALESCE(storage_used, 0) - bytes)
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to atomically increment share link access count
CREATE OR REPLACE FUNCTION increment_access_count(link_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE share_links 
  SET access_count = COALESCE(access_count, 0) + 1
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;
