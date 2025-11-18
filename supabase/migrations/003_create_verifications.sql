-- Verification history table
CREATE TABLE verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  faculty_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Verification Details
  status verification_status NOT NULL,
  comments TEXT,
  signature_url TEXT, -- Digital signature image
  
  -- Metadata
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX verifications_document_id_idx ON verifications(document_id);
CREATE INDEX verifications_faculty_id_idx ON verifications(faculty_id);
CREATE INDEX verifications_verified_at_idx ON verifications(verified_at DESC);

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
      SELECT id FROM profiles WHERE role IN ('faculty', 'admin')
    )
  );

CREATE POLICY "Faculty can insert verifications"
  ON verifications FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('faculty', 'admin')
    )
  );