-- Documents table
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Document Info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category = ANY (ARRAY['resume'::text, 'certificate'::text, 'transcript'::text, 'project'::text, 'other'::text])),
  
  -- Additional Info
  tags TEXT[] DEFAULT '{}',
  
  -- File Info
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Organization
  is_favorite BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX documents_user_id_idx ON documents(user_id);
CREATE INDEX documents_category_idx ON documents(category);
CREATE INDEX documents_is_public_idx ON documents(is_public);
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

-- Trigger
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();