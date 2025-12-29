-- Shared links table
CREATE TABLE share_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Link Details
  share_code TEXT NOT NULL,
  
  -- Access Control
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  max_access INTEGER,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX share_links_document_id_idx ON share_links(document_id);
CREATE INDEX share_links_share_code_idx ON share_links(share_code);
CREATE INDEX share_links_expires_at_idx ON share_links(expires_at);

-- Enable RLS
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own shared links"
  ON share_links FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active shared links"
  ON share_links FOR SELECT
  USING (
    is_active = true AND
    (expires_at IS NULL OR expires_at > NOW())
  );