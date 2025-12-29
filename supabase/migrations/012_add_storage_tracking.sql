-- Add Storage Tracking Table
CREATE TABLE storage_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  used_bytes bigint NOT NULL DEFAULT 0,
  limit_bytes bigint NOT NULL DEFAULT 104857600,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT storage_usage_pkey PRIMARY KEY (id),
  CONSTRAINT storage_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
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