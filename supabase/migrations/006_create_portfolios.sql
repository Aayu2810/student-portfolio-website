-- Auto-generated student portfolios
CREATE TABLE portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Portfolio Content (JSON)
  personal_info JSONB DEFAULT '{}',
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  internships JSONB DEFAULT '[]',
  projects JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  
  -- Settings
  is_public BOOLEAN DEFAULT false,
  custom_url TEXT UNIQUE,
  
  -- PDF Generation
  pdf_url TEXT,
  pdf_generated_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own portfolio"
  ON portfolios FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public portfolios are viewable"
  ON portfolios FOR SELECT
  USING (is_public = true);

-- Trigger
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update portfolio from documents
CREATE OR REPLACE FUNCTION update_portfolio_from_documents()
RETURNS TRIGGER AS $$
DECLARE
  portfolio_record RECORD;
BEGIN
  -- Get or create portfolio
  INSERT INTO portfolios (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update portfolio based on verified documents
  IF NEW.verification_status = 'verified' THEN
    UPDATE portfolios
    SET
      certifications = CASE 
        WHEN NEW.category = 'certificate' THEN
          COALESCE(certifications, '[]'::jsonb) || jsonb_build_object(
            'title', NEW.title,
            'issuer', NEW.issuing_authority,
            'date', NEW.issue_date,
            'document_id', NEW.id
          )
        ELSE certifications
      END,
      internships = CASE 
        WHEN NEW.category = 'internship' THEN
          COALESCE(internships, '[]'::jsonb) || jsonb_build_object(
            'title', NEW.title,
            'organization', NEW.issuing_authority,
            'date', NEW.issue_date,
            'document_id', NEW.id
          )
        ELSE internships
      END,
      projects = CASE 
        WHEN NEW.category = 'project' THEN
          COALESCE(projects, '[]'::jsonb) || jsonb_build_object(
            'title', NEW.title,
            'description', NEW.description,
            'date', NEW.issue_date,
            'document_id', NEW.id
          )
        ELSE projects
      END,
      achievements = CASE 
        WHEN NEW.category = 'achievement' THEN
          COALESCE(achievements, '[]'::jsonb) || jsonb_build_object(
            'title', NEW.title,
            'issuer', NEW.issuing_authority,
            'date', NEW.issue_date,
            'document_id', NEW.id
          )
        ELSE achievements
      END,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_portfolio_on_document_verify
  AFTER INSERT OR UPDATE OF verification_status ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_from_documents();