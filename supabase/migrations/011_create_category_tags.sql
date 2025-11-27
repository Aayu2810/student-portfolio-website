-- Create Category Tags Table
CREATE TABLE IF NOT EXISTS category_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
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
