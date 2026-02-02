-- Create portfolios table (IF NOT EXISTS handles existing tables)
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  about TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  theme TEXT DEFAULT 'modern',
  custom_domain TEXT,
  is_public BOOLEAN DEFAULT false,
  enable_qr_code BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes (IF NOT EXISTS handles existing indexes)
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_is_public ON portfolios(is_public);

-- Enable RLS (idempotent)
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can view public portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can update own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can delete own portfolio" ON portfolios;

-- Create RLS policies
CREATE POLICY "Users can view own portfolio" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public portfolios" ON portfolios
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own portfolio" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Create function (IF NOT EXISTS handles existing functions)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_portfolios_updated_at 
  BEFORE UPDATE ON portfolios 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
