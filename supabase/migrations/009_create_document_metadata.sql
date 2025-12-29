-- Create Document Metadata Table
CREATE TABLE document_metadata (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  document_id uuid NOT NULL,
  checksum text,
  tags TEXT[] DEFAULT '{}'::text[],
  custom_fields jsonb DEFAULT '{}'::jsonb,
  extracted_text text,
  language text,
  page_count integer,
  process_status text NOT NULL DEFAULT 'pending'::text,
  thumbnail_url text,
  search_vector tsvector,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT document_metadata_pkey PRIMARY KEY (id),
  CONSTRAINT document_metadata_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents(id)
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