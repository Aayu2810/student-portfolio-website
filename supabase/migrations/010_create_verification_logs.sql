-- Create Verification Logs Table
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'requested', 'approved', 'rejected', 'updated'
  performer_id UUID NOT NULL REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_verification_logs_verification_id ON verification_logs(verification_id);
CREATE INDEX idx_verification_logs_performer_id ON verification_logs(performer_id);
CREATE INDEX idx_verification_logs_created_at ON verification_logs(created_at DESC);

-- Enable RLS
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view verification logs for own documents" ON verification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM verifications v
      JOIN documents d ON v.document_id = d.id
      WHERE v.id = verification_logs.verification_id
      AND (d.user_id = auth.uid() OR v.verifier_id = auth.uid())
    )
  );

CREATE POLICY "System can create verification logs" ON verification_logs
  FOR INSERT WITH CHECK (auth.uid() = performer_id);
