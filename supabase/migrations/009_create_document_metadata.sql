-- Create Document Metadata Table
CREATE TABLE IF NOT EXISTS document_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tags TEXT[],
  custom_fields JSONB,
  extracted_text TEXT, -- For search indexing
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_document_metadata_document_id ON document_metadata(document_id);
CREATE INDEX idx_document_metadata_tags ON document_metadata USING GIN(tags);
CREATE INDEX idx_document_metadata_text ON document_metadata USING GIN(to_tsvector('english', extracted_text));

-- Enable RLS
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view metadata for own documents" ON document_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_metadata.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage metadata for own documents" ON document_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_metadata.document_id
      AND documents.user_id = auth.uid()
    )
  );
