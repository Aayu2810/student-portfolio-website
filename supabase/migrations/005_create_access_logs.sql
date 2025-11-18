-- Access logs for audit trail
CREATE TABLE access_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  
  -- Access Details
  accessed_by UUID REFERENCES profiles(id), -- NULL for anonymous via shared link
  share_token TEXT, -- If accessed via shared link
  
  -- Action
  action TEXT NOT NULL CHECK (action IN ('view', 'download', 'share')),
  
  -- Request Info
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX access_logs_document_id_idx ON access_logs(document_id);
CREATE INDEX access_logs_accessed_by_idx ON access_logs(accessed_by);
CREATE INDEX access_logs_accessed_at_idx ON access_logs(accessed_at DESC);

-- Enable RLS
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view logs of own documents"
  ON access_logs FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert logs"
  ON access_logs FOR INSERT
  WITH CHECK (true);

-- Function to log access
CREATE OR REPLACE FUNCTION log_document_access(
  p_document_id UUID,
  p_accessed_by UUID,
  p_share_token TEXT,
  p_action TEXT,
  p_ip_address INET,
  p_user_agent TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO access_logs (
    document_id,
    accessed_by,
    share_token,
    action,
    ip_address,
    user_agent
  ) VALUES (
    p_document_id,
    p_accessed_by,
    p_share_token,
    p_action,
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;