-- Shared links table
CREATE TABLE shared_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Link Details
  share_token TEXT UNIQUE NOT NULL,
  pin_code TEXT, -- Optional 6-digit PIN
  
  -- Access Control
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  
  -- Permissions
  allow_download BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX shared_links_document_id_idx ON shared_links(document_id);
CREATE INDEX shared_links_share_token_idx ON shared_links(share_token);
CREATE INDEX shared_links_expires_at_idx ON shared_links(expires_at);

-- Enable RLS
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own shared links"
  ON shared_links FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active shared links"
  ON shared_links FOR SELECT
  USING (
    is_active = true AND
    (expires_at IS NULL OR expires_at > NOW()) AND
    (max_views IS NULL OR current_views < max_views)
  );

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;