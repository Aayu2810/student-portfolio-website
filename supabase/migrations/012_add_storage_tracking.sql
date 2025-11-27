-- Add Storage Tracking Table
CREATE TABLE IF NOT EXISTS storage_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  used_bytes BIGINT DEFAULT 0,
  limit_bytes BIGINT DEFAULT 104857600, -- 100MB default limit
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_storage_usage_user_id ON storage_usage(user_id);

-- Create function to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO storage_usage (user_id, used_bytes)
    VALUES (NEW.user_id, NEW.file_size)
    ON CONFLICT (user_id)
    DO UPDATE SET used_bytes = storage_usage.used_bytes + NEW.file_size, updated_at = NOW();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE storage_usage
    SET used_bytes = GREATEST(0, used_bytes - OLD.file_size), updated_at = NOW()
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on documents table
CREATE TRIGGER update_storage_on_document_change
AFTER INSERT OR DELETE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_storage_usage();

-- Enable RLS
ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own storage usage" ON storage_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage storage usage" ON storage_usage
  FOR ALL USING (true);
