-- Verification history table
CREATE TABLE verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  verifier_id UUID,
  
  -- Verification Details
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX verifications_document_id_idx ON verifications(document_id);
CREATE INDEX verifications_verifier_id_idx ON verifications(verifier_id);
CREATE INDEX verifications_status_idx ON verifications(status);
CREATE INDEX verifications_created_at_idx ON verifications(created_at DESC);

-- Enable RLS
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view verifications of own documents"
  ON verifications FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Faculty can view all verifications"
  ON verifications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE first_name = 'admin' OR last_name = 'admin' OR email LIKE '%@faculty.%'
    )
  );

CREATE POLICY "Faculty can insert verifications"
  ON verifications FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE first_name = 'admin' OR last_name = 'admin' OR email LIKE '%@faculty.%'
    )
  );