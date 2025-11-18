-- Document types enum
CREATE TYPE document_category AS ENUM (
  'certificate',
  'internship',
  'project',
  'achievement',
  'transcript',
  'id_proof',
  'other'
);

-- Verification status enum
CREATE TYPE verification_status AS ENUM (
  'pending',
  'verified',
  'rejected'
);

-- Documents table
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Document Info
  title TEXT NOT NULL,
  description TEXT,
  category document_category NOT NULL,
  
  -- File Info
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  
  -- Verification
  verification_status verification_status DEFAULT 'pending',
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Organization
  issue_date DATE,
  issuing_authority TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX documents_user_id_idx ON documents(user_id);
CREATE INDEX documents_category_idx ON documents(category);
CREATE INDEX documents_verification_status_idx ON documents(verification_status);
CREATE INDEX documents_created_at_idx ON documents(created_at DESC);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Faculty can view all documents"
  ON documents FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('faculty', 'admin')
    )
  );

CREATE POLICY "Faculty can update document verification"
  ON documents FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('faculty', 'admin')
    )
  );

-- Trigger
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();