-- Create Category Tags Table
CREATE TABLE category_tags (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name CHARACTER VARYING NOT NULL UNIQUE,
  description TEXT,
  color CHARACTER VARYING,
  icon CHARACTER VARYING,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT category_tags_pkey PRIMARY KEY (id)
);

-- Insert default categories
INSERT INTO category_tags (name, description, color) VALUES
  ('Academic', 'Academic documents and transcripts', '#3B82F6'),
  ('Certification', 'Professional certifications and licenses', '#10B981'),
  ('Internship', 'Internship certificates and letters', '#F59E0B'),
  ('Project', 'Project reports and documentation', '#8B5CF6'),
  ('Achievement', 'Awards and achievements', '#EF4444'),
  ('Other', 'Miscellaneous documents', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE category_tags ENABLE ROW LEVEL SECURITY;

-- Create policies (everyone can read categories)
CREATE POLICY "Anyone can view categories" ON category_tags
  FOR SELECT USING (true);